import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, IconButton, Chip, Button, Dialog, Table, TableBody, TableCell, TableRow, TableContainer, TableHead
} from '@material-ui/core'
import FastForwardIcon from '@material-ui/icons/FastForward';
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, config } from './Modal/Supplier.modal'
import SupplierAdd from './SupplierAdd';
import SupplierEdit from './SupplierEdit'
import SearchOne from '../../../components/SearchOne'
import LoopIcon from '@material-ui/icons/Loop';
import ExportExcel from '../../../components/ExportExcel'
import DisplayColumn from '../../../components/DisplayColumn';

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
    }
}

const SupplierList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState('')
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [processing, setProcessing] = useState(false)
    const [searchProcess, setSearchProcess] = useState(false)

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
    }

    const handleResultGetAll = (reqInfoMap, message) => {
        setSearchProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
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
        if (message['PROC_CODE'] !== 'SYS000') {
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

    const onClickColumn = e => {
        setAnChorEl(e.currentTarget);
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
        setName(item ? item.o_2 : '')
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
        { label: t('partner.supplier.vender_nm_v'), key: 'vender_nm_v' },
        { label: t('partner.supplier.vender_nm_e'), key: 'vender_nm_e' },
        { label: t('partner.supplier.vender_nm_short'), key: 'vender_nm_short' },
        { label: t('partner.supplier.address'), key: 'address' },
        { label: t('partner.supplier.phone'), key: 'phone' },
        { label: t('partner.supplier.fax'), key: 'fax' },
        { label: t('partner.supplier.email'), key: 'email' },
        { label: t('partner.supplier.website'), key: 'website' },
        { label: t('partner.supplier.tax_cd'), key: 'tax_cd' },
        { label: t('partner.supplier.bank_acnt_no'), key: 'bank_acnt_no' },
        { label: t('partner.supplier.bank_acnt_nm'), key: 'bank_acnt_nm' },
        { label: t('partner.supplier.bank_nm'), key: 'bank_nm' },
        { label: t('partner.supplier.agent_nm'), key: 'agent_nm' },
        { label: t('partner.supplier.agent_fun'), key: 'agent_fun' },
        { label: t('partner.supplier.agent_address'), key: 'agent_address' },
        { label: t('partner.supplier.agent_phone'), key: 'agent_phone' },
        { label: t('partner.supplier.agent_email'), key: 'agent_email' },
        { label: t('partner.supplier.default_yn'), key: 'default_yn' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['vender_nm_v'] = data.o_2
            item['vender_nm_e'] = data.o_3
            item['vender_nm_short'] = data.o_4
            item['address'] = data.o_5
            item['phone'] = data.o_6
            item['fax'] = data.o_7
            item['email'] = data.o_8
            item['website'] = data.o_9
            item['tax_cd'] = data.o_10
            item['bank_acnt_no'] = data.o_11
            item['bank_acnt_nm'] = data.o_12
            item['bank_nm'] = data.o_14
            item['agent_nm'] = data.o_15
            item['agent_fun'] = data.o_16
            item['agent_address'] = data.o_17
            item['agent_phone'] = data.o_18
            item['agent_email'] = data.o_19
            item['default_yn'] = data.o_22
            item['createdUser'] = data.o_20
            item['createdDate'] = glb_sv.formatValue(data.o_21, 'date')
            // item['titleBranch'] = data.o_9
            return item
        })
        return result
    }

    const handleRefresh = () => {
        dataSourceRef.current = []
        setTotalRecords(0)
        getList(glb_sv.defaultValueSearch, searchValue)
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
                        name='supplier_name'
                        label={'partner.supplier.search_name'}
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
                    title={<>{t('partner.supplier.titleList')}
                    {/* <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                        <MoreVertIcon />
                    </IconButton> */}
                    <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='supplier' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                            <SupplierAdd onRefresh={handleRefresh} />
                        </div>
                    }
                />
                <CardContent>
                    <TableContainer className="tableContainer">
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
                                    {column.map(col => (
                                        <TableCell
                                            nowrap="true"
                                            className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                            key={col.field}
                                        >
                                            {t(col.title)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataSource.map((item, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            {column.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        case 'action':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onRemove(item)
                                                                        }}
                                                                    >
                                                                        <DeleteIcon style={{ color: 'red' }} fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onEdit(item)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )
                                                        case 'o_22':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {value === 'Y' ? t('yes') : t('no')}
                                                                </TableCell>
                                                            )
                                                        default:
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
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
                    <CardHeader title={t('partner.supplier.titleRemove', { name: name })} />
                    <CardContent>
                        {name}
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setShouldOpenRemoveModal(false)
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={processing ? 'button-loading' : ''} endIcon={processing && <LoopIcon />} size='small' onClick={handleDelete} variant="contained" color="secondary">
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal edit */}
            <SupplierEdit
                id={id}
                shouldOpenModal={shouldOpenEditModal}
                setShouldOpenModal={setShouldOpenEditModal}
                onRefresh={handleRefresh}
            />

        </>
    )
}

export default SupplierList