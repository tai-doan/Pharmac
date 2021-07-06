import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ColumnCtrComp from '../../../components/_ColumnCtr'
import SearChComp from '../../../components/_Search'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, config } from './Modal/Import.modal'
import ImportView from './ImportView';
import ImportEdit from './ImportEdit';
import ImportSearch from './ImportSearch';
import { DialogTitle } from '@material-ui/core'
import moment from 'moment'

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
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState('')
    const [searchModal, setSearchModal] = useState({
        start_dt: moment().day(-14).format('YYYYMMDD'),
        end_dt: moment().format('YYYYMMDD'),
        id_status: '1',
        vender_nm: ''
    })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [shouldOpenViewModal, setShouldOpenViewModal] = useState(false)
    const [deleteModalContent, setDeleteModalContent] = useState({
        invoice_imp_calc_rs: '1',
        note: ''
    })
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [processing, setProcessing] = useState(false)

    const import_SendReqFlag = useRef(false)
    const import_ProcTimeOut = useRef(null)
    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const saveContinue = useRef(false)
    const idRef = useRef(0)

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, 999999999999, searchModal.id_status, '');
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
                    case reqFunction.IMPORT_LIST:
                        resultGetList(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.IMPORT_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.IMPORT_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.IMPORT_DELETE:
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

    const getList = (startdate, endDate, index, status, name) => {
        const inputParam = [startdate, endDate, index || 999999999999, status, name.trim() + '%']
        sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        console.log('handleTimeOut: ', e)
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
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
            dataSourceRef.current = dataSourceRef.current.concat(newData.rows)
            setDataSource(dataSourceRef.current)
            if (newData.rows.length > 0) {
                setTotalRecords(newData.rowTotal)
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
            setShouldOpenModal(saveContinue.current)
            dataSourceRef.current = [];
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), 999999999999, searchModal.id_status, searchModal.vender_nm.trim())
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
            setShouldOpenEditModal(false)
            dataSourceRef.current = [];
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), 999999999999, searchModal.id_status, searchModal.vender_nm.trim())
        }
    }

    const resultRemove = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
        } else {
            setShouldOpenRemoveModal(false)
            dataSourceRef.current = dataSourceRef.current.filter(item => item.o_1 !== cltSeqResult.inputParam[0])
            setDataSource(dataSourceRef.current);
            setTotalRecords(dataSourceRef.current.length)
            setId(0);
            setName('')
            setDeleteModalContent({
                invoice_imp_calc_rs: '1',
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
        getList(moment(searchObject.start_dt).format('YYYYMMDD'), moment(searchObject.end_dt).format('YYYYMMDD'), 999999999999, searchObject.id_status, searchObject.vender_nm.trim())
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

    const onView = item => {
        setShouldOpenViewModal(item ? true : false)
        setId(item ? item.o_1 : 0)
    }

    const handleDelete = e => {
        e.preventDefault();
        idRef.current = id;
        const inputParam = [id, deleteModalContent.invoice_imp_calc_rs, deleteModalContent.note]
        sendRequest(serviceInfo.DELETE, inputParam, null, true, handleTimeOut)
        setId(0)
        setName('')
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(moment(searchModal.start_dt).format('YYYYMMDD'), moment(searchModal.end_dt).format('YYYYMMDD'), lastID, searchModal.id_status, searchModal.vender_nm.trim())
        }
    }

    const handleCloseViewModal = value => {
        setId(0);
        setShouldOpenViewModal(value)
    }

    const handleCloseAddModal = value => {
        setId(0);
        setShouldOpenModal(value)
    }

    const handleCloseEditModal = value => {
        setId(0);
        setShouldOpenEditModal(value)
    }

    const handleUpdate = dataObject => {
        const inputParam = [dataObject.o_1, // id
        dataObject.o_4, // nhà cung ứng
        moment(dataObject.o_6).format('YYYYMMDD'), // ngày tạo HĐ
        dataObject.o_8, // người giao hàng
        dataObject.o_9, // người nhận hàng
        dataObject.o_11 // note
        ];
        sendRequest(serviceInfo.UPDATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const handleChange = e => {
        const newModal = { ...deleteModalContent };
        newModal[e.target.name] = e.target.value
        setDeleteModalContent(newModal)
    }

    return (
        <>
            <div className="align-items-center ">
                <div className='mb-3'>
                    <ImportSearch
                        handleSearch={searchSubmit}
                    />
                </div>
                <div className='d-flex justify-content-between'>
                    <h6 className="d-flex font-weight-bold mb-2">{t('order.import.titleList')}</h6>
                    <div className='d-flex align-items-center'>
                        <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                        <Chip size="small" deleteIcon={<AutorenewIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                        <IconButton size='small' onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>

                        <ColumnCtrComp
                            anchorEl={anChorEl}
                            columns={tableColumn}
                            handleClose={onCloseColumn}
                            checkColumnChange={onChangeColumnView}
                        />
                    </div>
                </div>
            </div>

            {/* table */}
            <Paper className="mb-3">
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
                                    <TableCell nowrap="true"
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
                                                                <IconButton
                                                                    onClick={e => {
                                                                        onView(item)
                                                                    }}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
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
            </Paper>

            {/* modal delete */}
            <Dialog
                open={shouldOpenRemoveModal}
                onClose={e => {
                    setShouldOpenRemoveModal(false)
                }}
            >
                <DialogTitle>
                    {t('order.import.titleCancel', { name: name })}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="invoice_imp_calc_rs">{t('order.import.invoice_imp_calc_rs')}</InputLabel>
                                <Select
                                    labelId="invoice_imp_calc_rs"
                                    id="invoice_imp_calc_rs-select"
                                    value={deleteModalContent.invoice_imp_calc_rs || 'Y'}
                                    onChange={handleChange}
                                    label={t('order.import.invoice_imp_calc_rs')}
                                    name='invoice_imp_calc_rs'
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
                </DialogContent>
                <DialogActions>
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
                </DialogActions>
            </Dialog>

            {/* modal edit */}
            <ImportEdit
                id={id}
                shouldOpenEditModal={shouldOpenEditModal}
                handleCloseEditModal={handleCloseEditModal}
                handleUpdate={handleUpdate}
            />

            {/* modal view */}
            <ImportView
                id={id}
                shouldOpenViewModal={shouldOpenViewModal}
                handleCloseViewModal={handleCloseViewModal}
            />
        </>
    )
}

export default ImportList