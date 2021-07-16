import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, IconButton, Chip, Select, FormControl, MenuItem, InputLabel, TextField, Grid, Button, Dialog,
    Table, TableBody, TableCell, TableRow, TableContainer, TableHead, Paper, DialogActions, DialogContent
} from '@material-ui/core'
import FastForwardIcon from '@material-ui/icons/FastForward';
import DeleteIcon from '@material-ui/icons/Delete'
import VisibilityIcon from '@material-ui/icons/Visibility';
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

import { tableColumn, config } from './Modal/Supplier.modal'
import SupplierAdd from './SupplierAdd';
import SupplierEdit from './SupplierEdit'
import SearchOne from '../../../components/SearchOne'
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

const SupplierList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState('')
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [shouldOpenViewModal, setShouldOpenViewModal] = useState(false)
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [processing, setProcessing] = useState(false)

    const supplier_SendReqFlag = useRef(false)
    const supplier_ProcTimeOut = useRef(null)
    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const saveContinue = useRef(false)
    const idRef = useRef(0)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        getList(999999999999, '');
        const supplierSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                console.log('Supplier msg ', msg)
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.SUPPLIER_LIST:
                        resultGetList(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SUPPLIER_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SUPPLIER_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SUPPLIER_DELETE:
                        resultRemove(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            supplierSub.unsubscribe()
        }
    }, [])

    const getList = (lastIndex, value) => {
        const inputParam = [lastIndex, value.trim() + '%']
        sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        console.log('handleTimeOut: ', e)
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
    }

    const resultGetList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        supplier_SendReqFlag.current = false
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
        supplier_SendReqFlag.current = false
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
        supplier_SendReqFlag.current = false
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

    const resultRemove = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        supplier_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)

        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            setShouldOpenRemoveModal(false)
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
        setTotalRecords(0)
        getList(999999999999, value)
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
        const inputParam = [
            dataObject.vender_nm_v,
            dataObject.vender_nm_e,
            dataObject.vender_nm_short,
            dataObject.address,
            dataObject.phone,
            dataObject.fax,
            dataObject.email,
            dataObject.website,
            dataObject.tax_cd,
            dataObject.bank_acnt_no,
            dataObject.bank_acnt_nm,
            dataObject.bank_cd,
            dataObject.agent_nm,
            dataObject.agent_fun,
            dataObject.agent_address,
            dataObject.agent_phone,
            dataObject.agent_email,
            dataObject.default_yn
        ];
        sendRequest(serviceInfo.CREATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const handleUpdate = dataObject => {
        if (dataObject && Object.keys(dataObject).length === 0 && dataObject.constructor === Object) return
        const inputParam = [
            dataObject.o_1, //id
            dataObject.o_2, //tên tv
            dataObject.o_3, //tên ta
            dataObject.o_4, //tên ngắn
            dataObject.o_5, //địa chỉ
            dataObject.o_6, //sđt
            dataObject.o_7, //fax
            dataObject.o_8, //email
            dataObject.o_9, //web
            dataObject.o_10, //taxt
            dataObject.o_11, //tk ngân hàng
            dataObject.o_12, //tên tk ngân hàng
            dataObject.o_13, //mã ngân hàng
            dataObject.o_15, //tên người đại diện
            dataObject.o_16, //chức vụ
            dataObject.o_17, //địa chỉ
            dataObject.o_18, //sđt
            dataObject.o_19, //email
            dataObject.o_22 //xét mặc định
        ];
        sendRequest(serviceInfo.UPDATE, inputParam, e => console.log(e), true, handleTimeOut)
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

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                />
                <CardContent>
                    <SearchOne
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
                    title={<>{t('partner.supplier.titleList')}<IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                        <MoreVertIcon />
                    </IconButton></>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='supplier' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
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
            <Dialog maxWidth='sm'
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
                        <Button size='small' onClick={handleDelete} variant="contained" color="secondary">
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal add */}
            <SupplierAdd
                id={id}
                shouldOpenModal={shouldOpenModal}
                handleCloseAddModal={handleCloseAddModal}
                handleCreate={handleCreate}
            />

            {/* modal edit */}
            <SupplierEdit
                id={id}
                shouldOpenEditModal={shouldOpenEditModal}
                handleCloseEditModal={handleCloseEditModal}
                handleUpdate={handleUpdate}
            />

        </>
    )
}

export default SupplierList