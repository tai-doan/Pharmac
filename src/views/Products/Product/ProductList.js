import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, IconButton, Chip, Button, Dialog, Table, TableBody, TableCell, TableRow, TableContainer,
    TableHead, Tooltip, FormControl, MenuItem, Grid, TextField, InputLabel, Select
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import FastForwardIcon from '@material-ui/icons/FastForward';
import LoopIcon from '@material-ui/icons/Loop';
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import sendRequest from '../../../utils/service/sendReq'
import reqFunction from '../../../utils/constan/functions';

import { tableColumn, config } from './Modal/Product.modal'
import ProductAdd from './ProductAdd';
import ProductEdit from './ProductEdit'
import SearchOne from '../../../components/SearchOne'
import ExportExcel from '../../../components/ExportExcel'
import DisplayColumn from '../../../components/DisplayColumn';

import { ReactComponent as IC_LOCK_PERMISSION } from '../../../asset/images/lock-login.svg'

const serviceInfo = {
    GET_ALL: {
        functionName: config['list'].functionName,
        reqFunct: config['list'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    DELETE: {
        functionName: config['delete'].functionName,
        reqFunct: config['delete'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    LOCK: {
        functionName: 'blocking',
        reqFunct: reqFunction.LOCK_PRODUCT_UPDATE,
        biz: 'admin',
        object: 'products'
    }
}

const ProductList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState('')
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [shouldOpenLockModal, setShouldOpenLockModal] = useState(false)
    const [lockModal, setLockModal] = useState({})
    const [lockType, setLockType] = useState('Y')
    const [lockNote, setLockNote] = useState('')
    const [controlTimeOutKey, setControlTimeOutKey] = useState('')
    const [processing, setProcessing] = useState(false)
    const [searchProcess, setSearchProcess] = useState(false)
    const [id, setId] = useState(0)
    const [name, setName] = useState('')

    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const idRef = useRef(0)

    useEffect(() => {
        getList(glb_sv.defaultValueSearch, '');
    }, [])

    const getList = (lastIndex, value) => {
        const inputParam = [lastIndex, '%' + value.trim() + '%']
        setSearchProcess(true)
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetAll, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcessing(false)
        setSearchProcess(false)
        setControlTimeOutKey('')
    }

    const handleResultGetAll = (reqInfoMap, message) => {
        setSearchProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[0] === glb_sv.defaultValueSearch) {
                    setTotalRecords(newData.rowTotal)
                } else {
                    setTotalRecords(dataSourceRef.current.length - newData.rows.length + newData.rowTotal)
                }
                dataSourceRef.current = dataSourceRef.current.concat(newData.rows)
                setDataSource(dataSourceRef.current)
            } else {
                dataSourceRef.current = [];
                setDataSource([])
                setTotalRecords(0)
            }
        }
    }

    const handleResultRemove = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setShouldOpenRemoveModal(false)
        setProcessing(false)
        setControlTimeOutKey('')
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            dataSourceRef.current = []
            setName('')
            setId(0);
            setDataSource([]);
            setTotalRecords(0)
            getList(glb_sv.defaultValueSearch, searchValue)
        }
    }

    const onCloseColumn = () => {
        setAnChorEl(null);
    }

    const onChangeColumnView = item => {
        const newColumn = [...column]
        const index = newColumn.findIndex(obj => obj.field === item.field)
        if (index >= 0) {
            newColumn[index]['show'] = !column[index]['show']
            setColumn(newColumn)
        }
    }

    const searchSubmit = value => {
        // if (value === searchRef.current) return
        searchRef.current = value
        dataSourceRef.current = []
        setSearchValue(value)
        setTotalRecords(0)
        getList(glb_sv.defaultValueSearch, value)
    }

    const onRemove = item => {
        setShouldOpenRemoveModal(item ? true : false);
        setId(item ? item.o_1 : 0)
        setName(item ? item.o_5 : '')
    }

    const onEdit = item => {
        setShouldOpenEditModal(item ? true : false)
        setId(item ? item.o_1 : 0)
        idRef.current = item && item.o_1 > 0 ? item.item && item.o_1 > 0 : 0
    }

    const handleDelete = e => {
        // e.preventDefault();
        idRef.current = id;
        setProcessing(true)
        setControlTimeOutKey(serviceInfo.DELETE.reqFunct + '|' + JSON.stringify([id]))
        sendRequest(serviceInfo.DELETE, [id], handleResultRemove, true, handleTimeOut)
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(lastID, searchValue)
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('menu.productGroup'), key: 'productGroup' },
        { label: t('products.product.code'), key: 'code' },
        { label: t('products.product.name'), key: 'name' },
        { label: t('products.product.barcode'), key: 'barcode' },
        { label: t('products.product.content'), key: 'content' },
        { label: t('products.product.contraind'), key: 'contraind' },
        { label: t('products.product.designate'), key: 'designate' },
        { label: t('products.product.dosage'), key: 'dosage' },
        { label: t('products.product.interact'), key: 'interact' },
        { label: t('products.product.manufact'), key: 'manufact' },
        { label: t('products.product.effect'), key: 'effect' },
        { label: t('products.product.overdose'), key: 'overdose' },
        { label: t('products.product.packing'), key: 'packing' },
        { label: t('products.product.storages'), key: 'storages' },
        { label: t('menu.configUnit'), key: 'unit' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['productGroup'] = data.o_3
            item['code'] = data.o_4
            item['name'] = data.o_5
            item['barcode'] = data.o_6
            item['content'] = data.o_7
            item['contraind'] = data.o_8
            item['designate'] = data.o_8
            item['dosage'] = data.o_10
            item['interact'] = data.o_11
            item['manufact'] = data.o_12
            item['effect'] = data.o_13
            item['overdose'] = data.o_14
            item['packing'] = data.o_15
            item['storages'] = data.o_16
            item['unit'] = data.o_18
            item['createdUser'] = data.o_19
            item['createdDate'] = glb_sv.formatValue(data.o_20, 'date')
            item['titleBranch'] = data.o_21
            return item
        })
        return result
    }

    const handleRefresh = () => {
        dataSourceRef.current = []
        setTotalRecords(0)
        getList(glb_sv.defaultValueSearch, searchValue)
    }

    const onLock = item => {
        setLockModal(item)
        setShouldOpenLockModal(true)
    }

    const handleLock = () => {
        if (!lockModal.o_1 || !lockType) return
        setProcessing(true)
        const inputParam = [lockModal.o_1, lockType, lockNote]
        setControlTimeOutKey(serviceInfo.LOCK.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.LOCK, inputParam, handleResultLockProduct, true, handleTimeOut)
    }

    const handleResultLockProduct = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcessing(false)
        setControlTimeOutKey('')
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            setShouldOpenLockModal(false)
            setLockModal({})
            setLockType('Y')
            setLockNote('')
        }
    }

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                />
                <CardContent>
                    <SearchOne
                        process={searchProcess}
                        name='product_name'
                        label={'products.product.search_name'}
                        searchSubmit={searchSubmit}
                    />
                </CardContent>
            </Card>
            <ColumnCtrComp
                anchorEl={anChorEl}
                columns={tableColumn}
                handleClose={onCloseColumn}
                checkColumnChange={onChangeColumnView}
            />
            <Card>
                <CardHeader
                    title={
                        <>
                            {t('products.product.titleList')}
                            {/* <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                                <MoreVertIcon />
                            </IconButton> */}
                            <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                        </>
                    }
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size='small' variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size='small' className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color='primary' label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='product' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                            <ProductAdd onRefresh={handleRefresh} />
                        </div>
                    }
                />
                <CardContent>
                    <TableContainer className='tableContainer'>
                        <Table stickyHeader>
                            <caption
                                className={['text-center text-danger border-bottom', dataSource.length > 0 ? 'd-none' : ''].join(
                                    ' '
                                )}
                            >
                                {t('lbl.emptyData')}
                            </caption>
                            <TableHead>
                                <TableRow>
                                    {column?.map(col => (
                                        <TableCell
                                            nowrap='true'
                                            className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                            key={col.field}
                                        >
                                            {t(col.title)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataSource?.length > 0 && dataSource?.map((item, index) => {
                                    return (
                                        <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                                            {column?.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        case 'action':
                                                            return (
                                                                <TableCell nowrap='true' key={indexRow} align={col.align}>
                                                                    {glb_sv.userLev === '0' && <Tooltip title={t('products.product.lock')}>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                onLock(item)
                                                                            }}
                                                                        >
                                                                            <IC_LOCK_PERMISSION style={{ color: 'red' }} fontSize='small' />
                                                                        </IconButton>
                                                                    </Tooltip>}
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onRemove(item)
                                                                        }}
                                                                    >
                                                                        <DeleteIcon style={{ color: 'red' }} fontSize='small' />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onEdit(item)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize='small' />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )
                                                        default:
                                                            return (
                                                                <TableCell nowrap='true' key={indexRow} align={col.align}>
                                                                    {glb_sv.formatValue(value, col['type'])}
                                                                </TableCell>
                                                            )
                                                    }
                                                }
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* modal delete */}
            <Dialog maxWidth='sm' fullWidth={true}
                TransitionProps={{
                    addEndListener: (node, done) => {
                        // use the css transitionend event to mark the finish of a transition
                        node.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                handleDelete()
                            }
                        });
                    }

                }}
                open={shouldOpenRemoveModal}
                onClose={e => {
                    setShouldOpenRemoveModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('products.product.titleRemove', { name: name })} />
                    <CardContent>
                        {name}
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            size='small'
                            onClick={e => {
                                setShouldOpenRemoveModal(false)
                            }}
                            variant='contained'
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={processing ? 'button-loading' : ''} endIcon={processing && <LoopIcon />} size='small' onClick={handleDelete} variant='contained' color='secondary'>
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal lock product */}
            <Dialog maxWidth='sm' fullWidth={true}
                TransitionProps={{
                    addEndListener: (node, done) => {
                        // use the css transitionend event to mark the finish of a transition
                        node.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                handleLock()
                            }
                        });
                    }

                }}
                open={shouldOpenLockModal}
            >
                <Card>
                    <CardHeader title={t('products.product.lock')} />
                    <CardContent>
                        <Grid container className={''} spacing={1}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth={true}
                                    margin='dense'
                                    disabled={true}
                                    label={t('products.product.designate')}
                                    value={lockModal.o_5}
                                    variant='outlined'
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl margin='dense' variant='outlined' className='w-100'>
                                    <InputLabel id='lock-type'>{t('products.product.lockType')}</InputLabel>
                                    <Select
                                        labelId='lock-type'
                                        id='lock-type-select'
                                        value={lockType}
                                        onChange={e => setLockType(e.target.value)}
                                        label={t('products.product.lockType')}
                                        name='lockType'
                                    >
                                        <MenuItem value='N'>{t('lockOrder.locked')}</MenuItem>
                                        <MenuItem value='Y'>{t('lockOrder.unlocked')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth={true}
                                    margin='dense'
                                    autoComplete='off'
                                    autoFocus={true}
                                    label={t('note')}
                                    onChange={e => setLockNote(e.target.value)}
                                    value={lockNote}
                                    variant='outlined'
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            size='small'
                            onClick={e => {
                                if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                    return
                                }
                                setShouldOpenLockModal(false)
                                setLockModal({})
                                setLockType('Y')
                                setLockNote('')
                            }}
                            variant='contained'
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={processing ? 'button-loading' : ''} endIcon={processing && <LoopIcon />} size='small' onClick={handleLock} variant='contained' color='secondary'>
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal edit */}
            <ProductEdit
                id={id}
                shouldOpenModal={shouldOpenEditModal}
                setShouldOpenModal={setShouldOpenEditModal}
                onRefresh={handleRefresh}
            />
        </>
    )
}

export default ProductList