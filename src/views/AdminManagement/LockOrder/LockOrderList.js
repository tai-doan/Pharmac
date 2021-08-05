import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog,
    Button, IconButton, Grid, FormControl, MenuItem, Select, InputLabel, TextField
} from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit'
import LoopIcon from '@material-ui/icons/Loop'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import DisplayColumn from '../../../components/DisplayColumn';
import { tableColumn } from './Modal/LockOrder.Modal'

const serviceInfo = {
    GET_ALL: {
        functionName: 'get_lock_ord',
        reqFunct: reqFunction.LOCK_ORDER_LIST,
        biz: 'admin',
        object: 'lock_order'
    },
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.LOCK_ORDER_UPDATE,
        biz: 'admin',
        object: 'lock_order'
    }
}

const LockOrderList = () => {
    const { t } = useTranslation()

    const [process, setProcess] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const [column, setColumn] = useState(tableColumn)
    const [editModal, setEditModal] = useState({})
    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState('')

    const [lockType, setLockType] = useState('N')

    useEffect(() => {
        const inputParam = [glb_sv.branchId || 0]
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
    }, [])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(true)
        setControlTimeOutKey('')
    }

    const handleResultGetList = (reqInfoMap, message) => {
        console.log('handleResultGetList LockOrder: ', reqInfoMap, message)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            const newData = message['PROC_DATA']
            setDataSource(newData.rows)
        }
    }

    const onEdit = item => {
        setEditModal(item)
        setShouldOpenEditModal(true)
    }

    const onChangeColumnView = item => {
        const newColumn = [...column]
        const index = newColumn.findIndex(obj => obj.field === item.field)
        if (index >= 0) {
            newColumn[index]['show'] = !column[index]['show']
            setColumn(newColumn)
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('branch'), key: 'branch' },
        { label: t('menu.userName'), key: 'userName' },
        { label: t('menu.userID'), key: 'userID' },
        { label: t('menu.userActiveStatus'), key: 'userActiveStatus' },
        { label: t('menu.userEmail'), key: 'userEmail' },
        { label: t('menu.userPhone'), key: 'userPhone' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['branch'] = data.o_3
            item['userName'] = data.o_4
            item['userID'] = data.o_5
            item['userActiveStatus'] = data.o_7
            item['userEmail'] = data.o_8
            item['userPhone'] = data.o_9
            item['createdUser'] = data.o_13
            item['createdDate'] = glb_sv.formatValue(data.o_14, 'date')
            return item
        })
        return result
    }

    const handleUpdate = () => {
        if (!editModal || !editModal.o_1) {
            return
        }
        setProcess(true)
        const inputParam = [glb_sv.branchId, editModal.o_1, lockType]
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey('')
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setLockType('N')
            setEditModal({})
            setShouldOpenEditModal(false)
            const inputParam = [glb_sv.branchId || 0]
            sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
        }
    }

    return (
        <>
            <Card>
                <CardHeader
                    title={<>
                        {t('lockOrder.titleList')}
                        <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                    </>} />
                <CardContent>
                    {/* table */}
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
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onEdit(item)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )
                                                        case 'o_5':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {value === '0' ? t('no') : t('yes')}
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

            {/* modal update lock order */}
            <Dialog maxWidth='sm' fullWidth={true}
                TransitionProps={{
                    addEndListener: (node, done) => {
                        // use the css transitionend event to mark the finish of a transition
                        node.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                handleUpdate()
                            }
                        });
                    }

                }}
                open={shouldOpenEditModal}
            >
                <Card>
                    <CardHeader title={t('lockOrder.updateTitle')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    disabled={true}
                                    autoComplete="off"
                                    label={t('lockOrder.invoice_tp_nm')}
                                    value={editModal.o_2}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="lock-type">{t('lockOrder.lock_tp_nm')}</InputLabel>
                                    <Select
                                        labelId="lock-type"
                                        id="lock-type-select"
                                        value={lockType}
                                        onChange={e => setLockType(e.target.value)}
                                        label={t('lockOrder.lock_tp_nm')}
                                        name='lockType'
                                    >
                                        <MenuItem value="N">{t('lockOrder.locked')}</MenuItem>
                                        <MenuItem value="Y">{t('lockOrder.unlocked')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                    return
                                }
                                setShouldOpenEditModal(false)
                                setEditModal({})
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={process ? 'button-loading' : ''} endIcon={process && <LoopIcon />} size='small' onClick={handleUpdate} variant="contained" color="secondary">
                            {t('btn.update')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default LockOrderList