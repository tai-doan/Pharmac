import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, Grid, TextField, Backdrop, makeStyles, CircularProgress, Button, InputAdornment, IconButton
} from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers'
import moment from 'moment'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

import LoopIcon from '@material-ui/icons/Loop'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'


const serviceInfo = {
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.PHARMACY_UPDATE,
        biz: 'admin',
        object: 'pharmacy'
    },
    UPDATE_USER_INFO: {
        functionName: 'update',
        reqFunct: reqFunction.USER_UPDATE,
        biz: 'admin',
        object: 'users'
    },
    GET_PHARMACY_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PHARMACY_BY_ID,
        biz: 'admin',
        object: 'pharmacy'
    },
    GET_USER_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.USER_BY_ID,
        biz: 'admin',
        object: 'users'
    },
    UPDATE_PASSWORD: {
        functionName: 'change_pass_user',
        reqFunct: reqFunction.USER_UPDATE_PASSWORD,
        biz: 'admin',
        object: 'users'
    }
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
}))

const PharmacyList = () => {
    const { t } = useTranslation()
    const classes = useStyles()
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const [process, setProcess] = useState(false)
    const [userInfo, setUserInfo] = useState({
        o_4: '',
        o_8: '',
        o_9: ''
    })
    const [pharmacyInfo, setPharmacyInfo] = useState({
        o_1: '',
        o_2: '',
        o_3: null,
        o_4: '',
        o_5: '',
        o_6: '',
        o_7: '',
        o_8: ''
    })
    const [changePassword, setChangePassword] = useState({
        oldPassword: '',
        newPassword: ''
    })
    const [showOldPass, setShowOldPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)

    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)

    const step9Ref = useRef(null)
    const step10Ref = useRef(null)
    const step11Ref = useRef(null)

    const step12Ref = useRef(null)
    const step13Ref = useRef(null)

    useEffect(() => {
        handleRefresh()
    }, [])

    const handleResultGetPharmarcyByID = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let data = newData.rows[0]
            data.o_7 = moment(data.o_7, 'YYYYMMDD').toString()
            setPharmacyInfo(data)
        }
    }

    const handleResultGetUserByID = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let data = newData.rows[0]
            data.o_1 = !!data.o_1 ? data.o_1 : null
            data.o_2 = !!data.o_2 ? data.o_2 : null
            data.o_3 = !!data.o_3 ? data.o_3 : ''
            data.o_4 = !!data.o_4 ? data.o_4 : ''
            data.o_5 = !!data.o_5 ? data.o_5 : ''
            data.o_6 = !!data.o_6 ? data.o_6 : ''
            data.o_7 = !!data.o_7 ? data.o_7 : ''
            data.o_8 = !!data.o_8 ? data.o_8 : ''
            data.o_9 = !!data.o_9 ? data.o_9 : ''
            data.o_10 = !!data.o_10 ? data.o_10 : ''
            data.o_11 = !!data.o_11 ? data.o_11 : ''
            data.o_12 = !!data.o_12 ? data.o_12 : ''
            data.o_13 = !!data.o_13 ? data.o_13 : ''
            setUserInfo(data)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleChangeUser = e => {
        const newUser = { ...userInfo }
        newUser[e.target.name] = e.target.value
        setUserInfo(newUser)
    }

    const handleChangePassword = e => {
        let newData = { ...changePassword }
        newData[e.target.name] = e.target.value
        setChangePassword(newData)
    }

    const handleChange = e => {
        const newPharmacy = { ...pharmacyInfo }
        newPharmacy[e.target.name] = e.target.value
        setPharmacyInfo(newPharmacy)
    }

    const handleDateChange = date => {
        const newPharmacy = { ...pharmacyInfo };
        newPharmacy['o_7'] = date;
        setPharmacyInfo(newPharmacy)
    }

    const checkValidate = () => {
        if (!!pharmacyInfo?.o_1 && !!pharmacyInfo?.o_2.trim() && !!pharmacyInfo?.o_5.trim() && !!pharmacyInfo?.o_6.trim() && !!pharmacyInfo?.o_7 &&
            !!pharmacyInfo?.o_8.trim() && !!pharmacyInfo.o_9.trim() && !!pharmacyInfo.o_10.trim() && !!pharmacyInfo.o_11.trim()) {
            return false
        }
        return true
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [
            pharmacyInfo.o_2,
            pharmacyInfo.o_6,
            moment(pharmacyInfo.o_7).format('YYYYMMDD'),
            pharmacyInfo.o_8,
            pharmacyInfo.o_5,
            pharmacyInfo.o_9,
            pharmacyInfo.o_10,
            pharmacyInfo.o_11
        ];
        setControlTimeOutKey(serviceInfo.UPDATE_USER_INFO.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE_USER_INFO, inputParam, handleResultUpdateUser, true, handleTimeOut)
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setPharmacyInfo({})
            sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [glb_sv.pharId], handleResultGetPharmarcyByID, true, handleTimeOut)
        }
    }

    const checkValidateUser = () => {
        if (!!userInfo.o_4.trim() && !!userInfo.o_8.trim() && !!userInfo.o_9.trim()) {
            return false
        }
        return true
    }

    const handleUpdateUser = () => {
        if (checkValidateUser()) return
        setProcess(true)
        const inputParam = [
            userInfo.o_2,
            userInfo.o_5,
            userInfo.o_4,
            userInfo.o_8,
            userInfo.o_9
        ];
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    const handleResultUpdateUser = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setUserInfo({})
            sendRequest(serviceInfo.GET_USER_BY_ID, [glb_sv.userId], handleResultGetUserByID, true, handleTimeOut)
        }
    }

    const checkValidateUpdatePassword = () => {
        if (!!changePassword?.oldPassword.trim() && !!changePassword?.newPassword.trim()) {
            return false
        }
        return true
    }

    const handleUpdatePassword = () => {
        if (checkValidateUpdatePassword()) return
        setProcess(true)
        const inputParam = [glb_sv.branchId, glb_sv.userId, changePassword.oldPassword, changePassword.newPassword];
        setControlTimeOutKey(serviceInfo.UPDATE_PASSWORD.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdatePassword, true, handleTimeOut)
    }

    const handleResultUpdatePassword = (reqInfoMap, message) => {
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
            setChangePassword({ oldPassword: '', newPassword: '' })
        }
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [glb_sv.pharId], handleResultGetPharmarcyByID, true, handleTimeOut)
        sendRequest(serviceInfo.GET_USER_BY_ID, [glb_sv.userId], handleResultGetUserByID, true, handleTimeOut)
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={process}>
                <CircularProgress color='inherit' />
            </Backdrop>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                    <Card className='mb-2'>
                        <CardHeader
                            title={t('menu.setting-pharmacy')}
                            action={
                                <Button size='small'
                                    onClick={() => {
                                        handleUpdate();
                                    }}
                                    variant="contained"
                                    disabled={checkValidate()}
                                    className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                                    endIcon={process && <LoopIcon />}
                                >
                                    {t('btn.update')}
                                </Button>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.pharmacyName')}
                                        name='o_2'
                                        value={pharmacyInfo.o_2 || ''}
                                        variant="outlined"
                                        onChange={handleChange}
                                        inputRef={step1Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step2Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.approve_status')}
                                        name='o_4'
                                        value={pharmacyInfo.o_4 || ''}
                                        variant="outlined"
                                        disabled={true}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.licence')}
                                        onChange={handleChange}
                                        name='o_6'
                                        value={pharmacyInfo.o_6 || ''}
                                        variant="outlined"
                                        inputRef={step2Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step3Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6} sm={4}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker
                                            disableToolbar
                                            margin="dense"
                                            variant="outlined"
                                            style={{ width: '100%' }}
                                            inputVariant="outlined"
                                            format="dd/MM/yyyy"
                                            id="licence_dt-picker-inline"
                                            label={t('pharmacy.licence_dt')}
                                            value={pharmacyInfo.o_7 || null}
                                            onChange={handleDateChange}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                            inputRef={step3Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step4Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </MuiPickersUtilsProvider>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.licence_pl')}
                                        onChange={handleChange}
                                        name='o_8'
                                        value={pharmacyInfo.o_8 || ''}
                                        variant="outlined"
                                        inputRef={step4Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step5Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.address')}
                                        onChange={handleChange}
                                        name='o_5'
                                        value={pharmacyInfo.o_5 || ''}
                                        variant="outlined"
                                        inputRef={step5Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step6Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.boss_name')}
                                        onChange={handleChange}
                                        name='o_9'
                                        value={pharmacyInfo.o_9 || ''}
                                        variant="outlined"
                                        inputRef={step6Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step7Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.boss_phone')}
                                        onChange={handleChange}
                                        name='o_10'
                                        value={pharmacyInfo.o_10 || ''}
                                        variant="outlined"
                                        inputRef={step7Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step8Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.boss_email')}
                                        onChange={handleChange}
                                        name='o_11'
                                        value={pharmacyInfo.o_11 || ''}
                                        variant="outlined"
                                        inputRef={step8Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleUpdate()
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card className='mb-2'>
                        <CardHeader
                            title={t('menu.setting-user')}
                            action={
                                <Button size='small'
                                    onClick={() => {
                                        handleUpdateUser()
                                    }}
                                    variant="contained"
                                    disabled={checkValidateUser()}
                                    className={checkValidateUser() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                                    endIcon={process && <LoopIcon />}
                                >
                                    {t('btn.update')}
                                </Button>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.userID')}
                                        name='o_5'
                                        value={userInfo.o_5 || ''}
                                        variant="outlined"
                                        disabled={true}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.userActiveStatus')}
                                        name='o_7'
                                        value={userInfo.o_7 || ''}
                                        variant="outlined"
                                        disabled={true}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        disabled={true}
                                        autoComplete="off"
                                        label={t('user.userLevel')}
                                        value={userInfo.o_11 === '0' ? t('user.userAdmin') : t('user.userNormal')}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.userName')}
                                        name='o_4'
                                        value={userInfo.o_4 || ''}
                                        variant="outlined"
                                        onChange={handleChangeUser}
                                        inputRef={step9Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step10Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.userEmail')}
                                        name='o_8'
                                        value={userInfo.o_8 || ''}
                                        variant="outlined"
                                        onChange={handleChangeUser}
                                        inputRef={step10Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step11Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.userPhone')}
                                        name='o_9'
                                        value={userInfo.o_9 || ''}
                                        variant="outlined"
                                        onChange={handleChangeUser}
                                        inputRef={step11Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleUpdateUser()
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card className='mb-2'>
                        <CardHeader
                            title={t('user.changePassword')}
                            action={
                                <Button size='small'
                                    onClick={() => {
                                        handleUpdatePassword()
                                    }}
                                    variant="contained"
                                    disabled={checkValidateUpdatePassword()}
                                    className={checkValidateUpdatePassword() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                                    endIcon={process && <LoopIcon />}
                                >
                                    {t('btn.update')}
                                </Button>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.oldPassword')}
                                        name='oldPassword'
                                        value={changePassword.oldPassword}
                                        variant="outlined"
                                        onChange={handleChangePassword}
                                        type={showOldPass ? 'text' : 'password'}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step12Ref.current.focus()
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowOldPass(!showOldPass)}
                                                        onMouseDown={e => e.preventDefault()}
                                                    >
                                                        {showOldPass ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('user.newPassword')}
                                        name='newPassword'
                                        value={changePassword.newPassword}
                                        variant="outlined"
                                        onChange={handleChangePassword}
                                        type={showNewPass ? 'text' : 'password'}
                                        inputRef={step12Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleUpdatePassword()
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowNewPass(!showNewPass)}
                                                        onMouseDown={e => e.preventDefault()}
                                                    >
                                                        {showNewPass ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </>
    )
}

export default PharmacyList