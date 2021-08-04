import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import {
    Card, CardHeader, CardContent, CardActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog,
    Button, Chip, IconButton, Grid, TextField, FormControl, MenuItem, Select, InputLabel, Tooltip
} from '@material-ui/core'

import FastForwardIcon from '@material-ui/icons/FastForward';
import EditIcon from '@material-ui/icons/Edit'
import LoopIcon from '@material-ui/icons/Loop';

import ColumnCtrComp from '../../../components/_ColumnCtr'
import ExportExcel from '../../../components/ExportExcel'
import DisplayColumn from '../../../components/DisplayColumn';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn } from './Modal/User.modal'
import UserSearch from './UserSearch';
import UserAdd from './UserAdd';
import UserEdit from './UserEdit';

import { ReactComponent as IC_UPDATE_PASSWORD } from '../../../asset/images/update-password.svg'
import { ReactComponent as IC_LOCK_PERMISSION } from '../../../asset/images/lock-login.svg'
import { ReactComponent as IC_PERMISSION } from '../../../asset/images/permission.svg'

const serviceInfo = {
    GET_ALL: {
        functionName: 'get_all',
        reqFunct: reqFunction.USER_LIST,
        biz: 'admin',
        object: 'users'
    },
    UPDATE_PASSWORD: {
        functionName: 'change_pass_adm',
        reqFunct: reqFunction.USER_UPDATE_PASSWORD,
        biz: 'admin',
        object: 'users'
    },
    LOCK: {
        functionName: 'lock_user',
        reqFunct: reqFunction.USER_LOCK,
        biz: 'admin',
        object: 'users'
    }
}

const UserList = () => {
    const { t } = useTranslation()
    const history = useHistory()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState({
        branchID: 0,
        name: '',
        status: '%'
    })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenLockModal, setShouldOpenLockModal] = useState(false)
    const [shouldOpenUpdatePasswordModal, setShouldOpenUpdatePasswordModal] = useState(false)
    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [modalUpdatePassword, setModalUpdatePassword] = useState({})
    const [modalLockLogin, setModalLockLogin] = useState({})
    const [lockStatus, setLockStatus] = useState('1')
    const [controlTimeOutKey, setControlTimeOutKey] = useState('')
    const [id, setId] = useState(0)
    const [processing, setProcessing] = useState(false)
    const [searchProcess, setSearchProcess] = useState(false)

    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const idRef = useRef(0)

    useEffect(() => {
        getList(searchValue.branchID, searchValue.name, searchValue.status);
    }, [])

    const getList = (branchID, name, status) => {
        const inputParam = [branchID || 0, '%' + name.trim() + '%', status || '%']
        setSearchProcess(true)
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcessing(false)
        setSearchProcess(false)
    }

    const handleResultGetList = (reqInfoMap, message) => {
        setSearchProcess(false)
        console.log('msg: ', message)
        // SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[1] === '%%') {
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

    const handleResultLockLogin = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcessing(false)
        setControlTimeOutKey('')
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setLockStatus('1')
            setModalLockLogin({})
            setShouldOpenLockModal(false)
            getList(searchValue.branchID, searchValue.name, searchValue.status);
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

    const searchSubmit = obj => {
        // if (value === searchRef.current) return
        searchRef.current = obj
        dataSourceRef.current = []
        setSearchValue(obj)
        setTotalRecords(0)
        getList(obj.branch_id, obj.userName, obj.userStatus)
    }

    const onLock = item => {
        setShouldOpenLockModal(item ? true : false);
        setModalLockLogin(item ? item : {})
    }

    const onEdit = item => {
        setId(item ? item.o_5 : 0)
        setShouldOpenEditModal(true)
        idRef.current = item && item.o_1 > 0 ? item.o_1 : 0
    }

    const handleLockStatusChange = e => {
        setLockStatus(e.target.value)
    }

    const handleLock = e => {
        // e.preventDefault();
        setProcessing(true)
        idRef.current = id;
        const inputParam = [modalLockLogin.o_2, modalLockLogin.o_5, lockStatus || '1']
        setControlTimeOutKey(serviceInfo.LOCK.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.LOCK, inputParam, handleResultLockLogin, true, handleTimeOut)
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

    const handleRefresh = () => {
        dataSourceRef.current = []
        setTotalRecords(0)
        getList(searchValue.branchID, searchValue.name, searchValue.status);
    }

    const onUpdatePassword = item => {
        setModalUpdatePassword(item)
        setShouldOpenUpdatePasswordModal(true)
    }

    const handleUpdatePassword = () => {
        const inputParam = [modalUpdatePassword.o_2, modalUpdatePassword.o_5, newPassword]
        setProcessing(true)
        setControlTimeOutKey(serviceInfo.UPDATE_PASSWORD.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE_PASSWORD, inputParam, handleResultUpdatePassword, true, handleTimeOut)
    }

    const handleResultUpdatePassword = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setControlTimeOutKey(null)
        setProcessing(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setShouldOpenUpdatePasswordModal(false)
            setModalUpdatePassword({})
            setNewPassword('')
        }
    }

    const handleChangePassword = e => {
        setNewPassword(e.target.value)
    }

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                />
                <CardContent>
                    <UserSearch
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
                    title={<>{t('user.titleList')}
                        {/* <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton> */}
                        <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            {/* <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} /> */}
                            <ExportExcel filename='user' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                            <UserAdd onRefresh={handleRefresh} />
                        </div>
                    }
                />
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
                                                                    <Tooltip title={t('user.lock_login')}>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                onLock(item)
                                                                            }}
                                                                        >
                                                                            <IC_LOCK_PERMISSION style={{ color: 'red' }} fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onEdit(item)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <Tooltip title={t('user.update_password')}>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                onUpdatePassword(item)
                                                                            }}
                                                                        >
                                                                            <IC_UPDATE_PASSWORD />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    {item['o_11'] === '1' && <Tooltip title={t('menu.setting-permission')}>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                history.push('/page/management/permission', { userID: item.o_5 })
                                                                            }}
                                                                        >
                                                                            <IC_PERMISSION />
                                                                        </IconButton>
                                                                    </Tooltip>}
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

            {/* modal update password */}
            <Dialog maxWidth='sm' fullWidth={true}
                TransitionProps={{
                    addEndListener: (node, done) => {
                        // use the css transitionend event to mark the finish of a transition
                        node.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                handleUpdatePassword()
                            }
                        });
                    }

                }}
                open={shouldOpenUpdatePasswordModal}
            >
                <Card>
                    <CardHeader title={t('user.update_password')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth={true}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('user.userID')}
                                    name='username'
                                    value={modalUpdatePassword.o_5}
                                    variant="outlined"
                                    className="uppercaseInput"
                                    disabled={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth={true}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('user.userPass')}
                                    name='newPassword'
                                    onChange={handleChangePassword}
                                    value={newPassword}
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleUpdatePassword()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setShouldOpenUpdatePasswordModal(false)
                                setModalUpdatePassword({})
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={processing ? 'button-loading' : ''} endIcon={processing && <LoopIcon />} size='small' onClick={handleUpdatePassword} variant="contained" color="secondary">
                            {t('btn.update')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal lock */}
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
                onClose={e => {
                    setShouldOpenLockModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('lock_login')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth={true}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('user.userID')}
                                    name='username'
                                    value={modalLockLogin.o_5}
                                    variant="outlined"
                                    className="uppercaseInput"
                                    disabled={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="lock-status">{t('user.status')}</InputLabel>
                                    <Select
                                        labelId="lock-status"
                                        id="lock-status-select"
                                        value={lockStatus || '1'}
                                        onChange={handleLockStatusChange}
                                        label={t('user.status')}
                                        name='userStatus'
                                    >
                                        <MenuItem value="1">{t('user.locked')}</MenuItem>
                                        <MenuItem value="0">{t('user.unlocked')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setShouldOpenLockModal(false)
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={processing ? 'button-loading' : ''} endIcon={processing && <LoopIcon />} size='small' onClick={handleLock} variant="contained" color="secondary">
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* modal edit */}
            <UserEdit
                id={id}
                shouldOpenModal={shouldOpenEditModal}
                setShouldOpenModal={setShouldOpenEditModal}
                onRefresh={handleRefresh}
            />
        </>
    )
}

export default UserList