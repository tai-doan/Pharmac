import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import FastForwardIcon from '@material-ui/icons/FastForward';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit'
import LoopIcon from '@material-ui/icons/Loop';
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, config } from './Modal/Export.modal'
import ExportSearch from './ExportSearch';
import {
    Card, CardHeader, CardContent, CardActions, IconButton, Chip, Select, FormControl, MenuItem, InputLabel, TextField, Grid, Button, Dialog,
    Table, TableBody, TableCell, TableRow, TableContainer, TableHead, Paper, DialogActions, DialogContent
} from '@material-ui/core'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { useHotkeys } from 'react-hotkeys-hook';
import AddIcon from '@material-ui/icons/Add';
import ExportExcel from '../../../components/ExportExcel'

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

const ExportList = () => {
    const { t } = useTranslation()
    const history = useHistory()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchModal, setSearchModal] = useState({
        start_dt: moment().day(-14).format('YYYYMMDD'),
        end_dt: moment().format('YYYYMMDD'),
        id_status: '1',
        cust_nm_v: ''
    })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [deleteModalContent, setDeleteModalContent] = useState({
        reason: '1',
        note: ''
    })
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [processing, setProcessing] = useState(false)
    const [searchProcess, setSearchProcess] = useState(false)

    const dataSourceRef = useRef([])
    const idRef = useRef(0)

    useHotkeys('f2', () => history.push('/page/order/ins-export'), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, glb_sv.defaultValueSearch, searchModal.id_status, '')
    }, [])

    const getList = (startdate, endDate, index, status, name) => {
        const inputParam = [startdate, endDate, index || glb_sv.defaultValueSearch, status, '%' + name.trim() + '%']
        setSearchProcess(true)
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetAll, true, handleTimeOut)
    }

    const handleResultGetAll = (reqInfoMap, message) => {
        setSearchProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[2] === glb_sv.defaultValueSearch) {
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

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcessing(false)
        setSearchProcess(false)
    }

    const handleResultDelete = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcessing(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            dataSourceRef.current = []
            setName('')
            setId(0);
            setDataSource([]);
            setTotalRecords(0)
            setDeleteModalContent({
                reason: '1',
                note: ''
            })
            setShouldOpenRemoveModal(false)
            getList(searchModal.start_dt, searchModal.end_dt, glb_sv.defaultValueSearch, searchModal.id_status, '')
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

    const searchSubmit = searchObject => {
        dataSourceRef.current = []
        setSearchModal({ ...searchObject })
        setTotalRecords(0)
        const newColumn = [...column]
        newColumn[6].show = searchObject.id_status === '2' ? true : false;
        setColumn(newColumn)
        getList(moment(searchObject.start_dt).format('YYYYMMDD'), moment(searchObject.end_dt).format('YYYYMMDD'), glb_sv.defaultValueSearch, searchObject.id_status, searchObject.cust_nm_v.trim())
    }

    const onRemove = item => {
        setShouldOpenRemoveModal(item ? true : false);
        setId(item ? item.o_1 : 0)
        setName(item ? item.o_2 : '')
    }

    const handleDelete = e => {
        // e.preventDefault();
        setProcessing(true)
        idRef.current = id;
        const inputParam = [id, deleteModalContent.reason, deleteModalContent.note]
        sendRequest(serviceInfo.DELETE, inputParam, handleResultDelete, true, handleTimeOut)
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), lastID, searchModal.id_status, searchModal.vender_nm.trim())
        }
    }

    const handleChange = e => {
        const newModal = { ...deleteModalContent };
        newModal[e.target.name] = e.target.value
        setDeleteModalContent(newModal)
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('order.export.invoice_no'), key: 'invoice_no' },
        { label: t('order.export.invoice_stat'), key: 'invoice_stat' },
        { label: t('order.export.cust_nm_v'), key: 'cust_nm_v' },
        { label: t('order.export.order_dt'), key: 'order_dt' },
        { label: t('order.export.input_dt'), key: 'input_dt' },
        { label: t('order.export.staff_nm'), key: 'staff_nm' },
        { label: t('order.export.cancel_reason'), key: 'cancel_reason' },
        { label: t('order.export.note'), key: 'note' },
        { label: t('order.export.total_prod'), key: 'total_prod' },
        { label: t('order.export.invoice_val'), key: 'invoice_val' },
        { label: t('order.export.invoice_discount'), key: 'invoice_discount' },
        { label: t('order.export.invoice_vat'), key: 'invoice_vat' },
        { label: t('order.export.invoice_settl'), key: 'invoice_settl' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['invoice_no'] = data.o_2
            item['invoice_stat'] = data.o_3 === '1' ? t('normal') : t('cancelled')
            item['cust_nm_v'] = data.o_5
            item['order_dt'] = glb_sv.formatValue(data.o_6, 'dated')
            item['input_dt'] = glb_sv.formatValue(data.o_7, 'dated')
            item['staff_nm'] = data.o_8
            item['cancel_reason'] = data.o_9
            item['note'] = data.o_10
            item['total_prod'] = data.o_11
            item['invoice_val'] = data.o_12
            item['invoice_discount'] = data.o_13
            item['invoice_vat'] = data.o_14
            item['invoice_settl'] = data.o_15
            item['createdUser'] = data.o_16
            item['createdDate'] = glb_sv.formatValue(data.o_17, 'date')
            // item['titleBranch'] = data.o_9
            return item
        })
        return result
    }

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                />
                <CardContent>
                    <ExportSearch
                        process={searchProcess}
                        handleSearch={searchSubmit}
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
                    title={<>{t('order.export.titleList')}
                        <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='export' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                            <Link to="/page/order/ins-export" className="normalLink">
                                <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => null} label={t('btn.add')} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} />
                            </Link>
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
                                        <TableCell nowrap="true" align={col.align}
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
                                                                <TableCell nowrap="true" nowrap="true" key={indexRow} align={col.align}>
                                                                    <IconButton disabled={item['o_3'] === '2' ? true : false}
                                                                        onClick={e => {
                                                                            onRemove(item)
                                                                        }}
                                                                    >
                                                                        <CancelOutlinedIcon style={{ color: 'red' }} fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton disabled={item['o_3'] === '2' ? true : false}
                                                                        onClick={e => {
                                                                            history.push('/page/order/edit-export', { id: item.o_1 })
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )
                                                        case 'o_3':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {value === '1' ? t('normal') : t('cancelled')}
                                                                </TableCell>
                                                            )
                                                        case 'o_9':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {item['o_3'] === '2' ? value : ''}
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
                    <CardHeader title={t('order.export.titleCancel', { name: name })} />
                    <CardContent>
                        <Grid container spacing={2}>{t('order.export.invoice_no')}: {name}</Grid>
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="reason">{t('order.export.reason')}</InputLabel>
                                    <Select
                                        labelId="reason"
                                        id="reason-select"
                                        value={deleteModalContent.reason || 'Y'}
                                        onChange={handleChange}
                                        label={t('order.export.reason')}
                                        name='reason'
                                    >
                                        <MenuItem value="1">{t('wrong_information')}</MenuItem>
                                        <MenuItem value="2">{t('cancel_export')}</MenuItem>
                                        <MenuItem value="3">{t('other_reason')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    rows={1}
                                    autoComplete="off"
                                    label={t('order.export.note')}
                                    onChange={handleChange}
                                    value={deleteModalContent.note || ''}
                                    name='note'
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
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

        </>
    )
}

export default ExportList