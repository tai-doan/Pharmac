import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, Grid, TextField, Backdrop, makeStyles, CircularProgress, Button, InputAdornment, IconButton, Divider, CardActions, Dialog
} from '@material-ui/core'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

import LoopIcon from '@material-ui/icons/Loop'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

const serviceInfo = {
    UPDATE_USER_INFO: {
        functionName: 'update',
        reqFunct: reqFunction.USER_UPDATE,
        biz: 'admin',
        object: 'users'
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

const UserInfoList = () => {
    const { t } = useTranslation()
    const classes = useStyles()
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const [process, setProcess] = useState(false)
    const [shouldOpenModalUpdatePassword, setShouldOpenModalUpdatePassword] = useState(false)
    const [userInfo, setUserInfo] = useState({
        o_4: '',
        o_8: '',
        o_9: ''
    })
    const [changePassword, setChangePassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showOldPass, setShowOldPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)

    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)

    useEffect(() => {
        handleRefresh()
    }, [])

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
        setControlTimeOutKey(serviceInfo.UPDATE_USER_INFO.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE_USER_INFO, inputParam, handleResultUpdateUser, true, handleTimeOut)
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
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setUserInfo({})
            sendRequest(serviceInfo.GET_USER_BY_ID, [glb_sv.userId], handleResultGetUserByID, true, handleTimeOut)
        }
    }

    const checkValidateUpdatePassword = () => {
        if (!!changePassword?.oldPassword.trim() && !!changePassword?.newPassword.trim() && !!changePassword?.confirmPassword.trim() && changePassword?.newPassword.trim() === changePassword?.confirmPassword.trim()) {
            return false
        }
        return true
    }

    const handleUpdatePassword = () => {
        if (checkValidateUpdatePassword()) return
        setProcess(true)
        const inputParam = [glb_sv.branchId, glb_sv.userId, changePassword.oldPassword, changePassword.newPassword];
        setControlTimeOutKey(serviceInfo.UPDATE_PASSWORD.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE_PASSWORD, inputParam, handleResultUpdatePassword, true, handleTimeOut)
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
            setChangePassword({ oldPassword: '', newPassword: '', confirmPassword: '' })
            setShouldOpenModalUpdatePassword(false)
        }
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_USER_BY_ID, [glb_sv.userId], handleResultGetUserByID, true, handleTimeOut)
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={process}>
                <CircularProgress color='inherit' />
            </Backdrop>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Card className='mb-2'>
                        <CardHeader
                            title={t('menu.setting-user')}
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
                                        label={t('user.userName')}
                                        name='o_4'
                                        value={userInfo.o_4 || ''}
                                        variant="outlined"
                                        onChange={handleChangeUser}
                                        inputRef={step1Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step2Ref.current.focus()
                                            }
                                        }}
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
                                        autoComplete="off"
                                        label={t('user.userEmail')}
                                        name='o_8'
                                        value={userInfo.o_8 || ''}
                                        variant="outlined"
                                        onChange={handleChangeUser}
                                        inputRef={step2Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step3Ref.current.focus()
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
                                        inputRef={step3Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleUpdateUser()
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => {
                                    setShouldOpenModalUpdatePassword(true);
                                    setTimeout(() => {
                                        step4Ref.current && step4Ref.current.focus()
                                    }, 150);
                                }}
                                className='bg-success text-white'
                                variant="contained" size='small'>
                                {t('user.changePassword')}
                            </Button>
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
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
            {/* Modal cập nhật mật khẩu*/}
            <Dialog maxWidth='sm' fullWidth={true}
                open={shouldOpenModalUpdatePassword}
            >
                <Card>
                    <CardHeader title={t('user.changePassword')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={12}>
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
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
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
                            <Grid item xs={12} sm={12}>
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
                                    inputRef={step5Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step6Ref.current.focus()
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
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('user.confirmPassword')}
                                    name='confirmPassword'
                                    value={changePassword.confirmPassword}
                                    variant="outlined"
                                    onChange={handleChangePassword}
                                    type={showConfirmPass ? 'text' : 'password'}
                                    inputRef={step6Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleUpdatePassword()
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                    onMouseDown={e => e.preventDefault()}
                                                >
                                                    {showConfirmPass ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                    return
                                }
                                setShouldOpenModalUpdatePassword(false);
                                setChangePassword({ oldPassword: '', newPassword: '', confirmPassword: '' })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleUpdatePassword();
                            }}
                            variant="contained"
                            disabled={checkValidateUpdatePassword()}
                            className={checkValidateUpdatePassword() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('btn.update')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default UserInfoList