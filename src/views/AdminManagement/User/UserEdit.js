import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions, Grid } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    UPDATE: {
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
    }
}

const UserEdit = ({ id, onRefresh, shouldOpenModal, setShouldOpenModal }) => {
    const { t } = useTranslation()

    const [userInfo, setUserInfo] = useState({
        o_2: '',
        o_5: '',
        o_4: '',
        o_8: '',
        o_9: '',
    })
    const [process, setProcess] = useState(false)

    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setUserInfo({}) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            sendRequest(serviceInfo.GET_USER_BY_ID, [id], handleResultGetByID, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleResultGetByID = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setUserInfo(newData.rows[0])
        }
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [userInfo.o_2, userInfo.o_5, userInfo.o_4, userInfo.o_8, userInfo.o_9];
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_CODE'] !== 'SYS000') {
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
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const checkValidate = () => {
        if (!!userInfo?.o_4 && !!userInfo?.o_5 && !!userInfo?.o_8 && !!userInfo?.o_9 && userInfo.o_5.trim() && userInfo.o_4.trim() && userInfo.o_8.trim() && userInfo.o_9.trim()) {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newUser = { ...userInfo }
        newUser[e.target.name] = e.target.value
        setUserInfo(newUser)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={shouldOpenModal}
        >
            <Card>
                <CardHeader title={t('user.updateUserInfo')} />
                <CardContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                disabled={true}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('user.userID')}
                                name='o_5'
                                value={userInfo.o_5 || ''}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('user.userName')}
                                onChange={handleChange}
                                name='o_4'
                                value={userInfo.o_4 || ''}
                                variant="outlined"
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
                                autoComplete="off"
                                label={t('user.userEmail')}
                                onChange={handleChange}
                                name='o_8'
                                value={userInfo.o_8 || ''}
                                variant="outlined"
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
                                onChange={handleChange}
                                name='o_9'
                                value={userInfo.o_9 || ''}
                                variant="outlined"
                                inputRef={step3Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
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
                            setShouldOpenModal(false);
                            setUserInfo({})
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
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
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default UserEdit