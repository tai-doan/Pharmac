import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import FastForwardIcon from '@material-ui/icons/FastForward';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton'
import ReplayIcon from '@material-ui/icons/Replay';
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, config } from './Modal/Import.modal'
import ImportSearch from './ImportSearch';
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import AddIcon from '@material-ui/icons/Add';
import ExportExcel from '../../../components/ExportExcel'

const serviceInfo = {
    GET_ALL: {
        functionName: config['list'].functionName,
        reqFunct: config['list'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    CREATE: {
        functionName: config['insert'].functionName,
        reqFunct: config['insert'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    UPDATE: {
        functionName: config['update'].functionName,
        reqFunct: config['update'].reqFunct,
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

const ImportList = () => {
    const { t } = useTranslation()
    const history = useHistory()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchModal, setSearchModal] = useState({
        start_dt: moment().subtract(1, 'months').format('YYYYMMDD'),
        end_dt: moment().format('YYYYMMDD')
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

    const import_SendReqFlag = useRef(false)
    const dataSourceRef = useRef([])
    const idRef = useRef(0)

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, glb_sv.defaultValueSearch);
        const importSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.SETTLEMENT_IMPORT_LIST:
                        resultGetList(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SETTLEMENT_IMPORT_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SETTLEMENT_IMPORT_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SETTLEMENT_IMPORT_DELETE:
                        resultRemove(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            importSub.unsubscribe()
        }
    }, [])

    const getList = (startdate, endDate, index) => {
        const inputParam = [startdate, endDate, index || glb_sv.defaultValueSearch]
        sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        console.log('handleTimeOut: ', e)
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const resultGetList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        import_SendReqFlag.current = false
        setProcessing(false)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        }
        if (message['PROC_DATA']) {
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

    const resultCreate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        import_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            setName('')
            setId(0)
            dataSourceRef.current = [];
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), glb_sv.defaultValueSearch)
        }
    }

    const resultUpdate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        import_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            setId(0)
            dataSourceRef.current = [];
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), glb_sv.defaultValueSearch)
        }
    }

    const resultRemove = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        import_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)

        setShouldOpenRemoveModal(false)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            dataSourceRef.current = dataSourceRef.current.filter(item => item.o_1 !== cltSeqResult.inputParam[0])
            setDataSource(dataSourceRef.current);
            setTotalRecords(dataSourceRef.current.length)
            setId(0);
            setName('')
            setDeleteModalContent({
                reason: '1',
                note: ''
            })
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
        getList(moment(searchObject.start_dt).format('YYYYMMDD'), moment(searchObject.end_dt).format('YYYYMMDD'), glb_sv.defaultValueSearch)
    }

    const onRemove = item => {
        setShouldOpenRemoveModal(item ? true : false);
        setId(item ? item.o_1 : 0)
        setName(item ? item.o_2 : '')
    }

    const handleDelete = e => {
        // e.preventDefault();
        idRef.current = id;
        const inputParam = [id, deleteModalContent.reason, deleteModalContent.note]
        sendRequest(serviceInfo.DELETE, inputParam, null, true, handleTimeOut)
        setId(0)
        setName('')
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), lastID)
        }
    }

    const handleChange = e => {
        const newModal = { ...deleteModalContent };
        newModal[e.target.name] = e.target.value
        setDeleteModalContent(newModal)
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('invoice_no'), key: 'invoice_no' },
        { label: t('settlement.trans_biz_nm'), key: 'trans_biz_nm' },
        { label: t('report.payment_method'), key: 'payment_method' },
        { label: t('report.payment_date'), key: 'payment_date' },
        { label: t('report.bank_transf_acc_number'), key: 'bank_transf_acc_number' },
        { label: t('report.bank_transf_acc_name'), key: 'bank_transf_acc_name' },
        { label: t('report.bank_transf_name'), key: 'bank_transf_name' },
        { label: t('report.bank_recei_acc_number'), key: 'bank_recei_acc_number' },
        { label: t('report.bank_recei_acc_name'), key: 'bank_recei_acc_name' },
        { label: t('report.bank_recei_name'), key: 'bank_recei_name' },
        { label: t('note'), key: 'note' },
        { label: t('report.payment_amount'), key: 'payment_amount' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['invoice_no'] = data.o_4
            item['trans_biz_nm'] = data.o_6
            item['payment_method'] = data.o_8
            item['payment_date'] = glb_sv.formatValue(data.o_9, 'dated')
            item['bank_transf_acc_number'] = data.o_11
            item['bank_transf_acc_name'] = data.o_12
            item['bank_transf_name'] = data.o_14
            item['bank_recei_acc_number'] = data.o_15
            item['bank_recei_acc_name'] = data.o_16
            item['bank_recei_name'] = data.o_18
            item['note'] = data.o_19
            item['payment_amount'] = data.o_20
            item['createdUser'] = data.o_21
            item['createdDate'] = glb_sv.formatValue(data.o_22, 'date')
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
                    <ImportSearch
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
                    title={<>{t('settlement.import')}
                        <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='settlement-import' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                            <Link to="/page/settlement/ins-import" className="normalLink">
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
                                        <TableRow className='table-row-p8' hover role="checkbox" tabIndex={-1} key={index}>
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
                                                                        <ReplayIcon style={{ color: 'red' }} fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton disabled={item['o_3'] === '2' ? true : false}
                                                                        onClick={e => {
                                                                            history.push('/page/settlement/edit-import', { id: item.o_1 })
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
                                                        case 'o_10':
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
                    <CardHeader title={t('order.import.titleCancel', { name: name })} />
                    <CardContent>
                        <Grid container spacing={2}>{t('order.import.invoice_no')}: {name}</Grid>
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="reason">{t('order.import.reason')}</InputLabel>
                                    <Select
                                        labelId="reason"
                                        id="reason-select"
                                        value={deleteModalContent.reason || 'Y'}
                                        onChange={handleChange}
                                        label={t('order.import.reason')}
                                        name='reason'
                                    >
                                        <MenuItem value="1">{t('wrong_information')}</MenuItem>
                                        <MenuItem value="2">{t('cancel_import')}</MenuItem>
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
                                    label={t('order.import.note')}
                                    onChange={handleChange}
                                    value={deleteModalContent.note || ''}
                                    name='note'
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={e => {
                                setShouldOpenRemoveModal(false)
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button onClick={handleDelete} variant="contained" color="secondary">
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

        </>
    )
}

export default ImportList