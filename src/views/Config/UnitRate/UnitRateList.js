import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import FastForwardIcon from '@material-ui/icons/FastForward';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
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

import { tableColumn, config } from './Modal/UnitRate.modal'
import UnitRateAdd from './UnitRateAdd';
import UnitRateEdit from './UnitRateEdit'
import SearchOne from '../../../components/SearchOne'
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
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

const UnitRateList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState('')
    const [page, setPage] = useState(0)
    const [totalRecords, setTotalRecords] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(20)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [shouldOpenViewModal, setShouldOpenViewModal] = useState(false)
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [note, setNote] = useState('')
    const [processing, setProcessing] = useState(false)

    const unit_SendReqFlag = useRef(false)
    const unit_ProcTimeOut = useRef(null)
    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const saveContinue = useRef(false)
    const unitNameFocus = useRef(null)
    const unitNoteFocus = useRef(null)
    const idRef = useRef(0)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        getList(999999999999, '');
        const unitSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.UNIT_RATE_LIST:
                        resultGetList(msg, cltSeqResult, reqInfoMap)
                        break
                    // case reqFunction.GET_UNIT:
                    //     resultGetById(msg, cltSeqResult, reqInfoMap)
                    //     break
                    case reqFunction.UNIT_RATE_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.UNIT_RATE_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.UNIT_RATE_DELETE:
                        resultRemove(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            unitSub.unsubscribe()
        }
    }, [])

    const getList = (lastIndex, value) => {
        const inputParam = [lastIndex, value.trim() + '%']
        sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const resultGetList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        unit_SendReqFlag.current = false
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
                if (reqInfoMap.inputParam[0] === 999999999999) {
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
        unit_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            setName('')
            setId(0)
            setShouldOpenModal(saveContinue.current)
            dataSourceRef.current = [];
            getList(999999999999, searchValue)
        }
    }

    const resultUpdate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        unit_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            setId(0)
            setShouldOpenEditModal(false)
            dataSourceRef.current = [];
            getList(999999999999, searchValue)
        }
    }

    const resultRemove = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        unit_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)

        setShouldOpenRemoveModal(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            dataSourceRef.current = dataSourceRef.current.filter(item => item.o_1 !== cltSeqResult.inputParam[0])
            setDataSource(dataSourceRef.current);
            setTotalRecords(dataSourceRef.current.length)
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
        if (value === searchRef.current) return
        searchRef.current = value
        dataSourceRef.current = []
        setSearchValue(value)
        setPage(0)
        setTotalRecords(0)
        getList(999999999999, value)
    }

    const onRemove = item => {
        setShouldOpenRemoveModal(item ? true : false);
        setId(item ? item.o_1 : 0)
        setName(item ? item.o_3 : '')
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
        // e.preventDefault();
        idRef.current = id;
        sendRequest(serviceInfo.DELETE, [id], null, true, handleTimeOut)
        setId(0)
        setName('')
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(lastID, searchValue)
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

    const handleCreate = (actionType, dataObject) => {
        if (dataObject && Object.keys(dataObject).length === 0 && dataObject.constructor === Object) return
        saveContinue.current = actionType
        const inputParam = [dataObject.product, dataObject.unit, Number(dataObject.rate)];
        sendRequest(serviceInfo.CREATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const handleUpdate = dataObject => {
        if (dataObject && Object.keys(dataObject).length === 0 && dataObject.constructor === Object) return
        const inputParam = [dataObject.o_1, dataObject.o_6];
        sendRequest(serviceInfo.UPDATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('menu.product'), key: 'product' },
        { label: t('menu.configUnit'), key: 'unit' },
        { label: t('config.unitRate.rate'), key: 'rate' },
        { label: t('config.unitRate.minRate'), key: 'minRate' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['product'] = data.o_3
            item['unit'] = data.o_5
            item['rate'] = data.o_6
            item['minRate'] = data.o_8
            item['createdUser'] = data.o_9
            item['createdDate'] = glb_sv.formatValue(data.o_10, 'date')
            item['titleBranch'] = data.o_11
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
                    <SearchOne
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
                    title={<>{t('config.unitRate.titleList')}
                        <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='unitRate' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
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
                    <CardHeader title={t('config.unitRate.titleRemove', { name: name })} />
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
                        <Button size='small' onClick={handleDelete} variant="contained" color="secondary">
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal add */}
            <UnitRateAdd
                id={id}
                shouldOpenModal={shouldOpenModal}
                handleCloseAddModal={handleCloseAddModal}
                handleCreate={handleCreate}
            />

            {/* modal edit */}
            <UnitRateEdit
                id={id}
                shouldOpenEditModal={shouldOpenEditModal}
                handleCloseEditModal={handleCloseEditModal}
                handleUpdate={handleUpdate}
            />
        </>
    )
}

export default UnitRateList