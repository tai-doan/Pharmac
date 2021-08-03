import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip, Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions, Grid } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'
import AddIcon from '@material-ui/icons/Add';
import LoopIcon from '@material-ui/icons/Loop';

import { defaultUserModalAdd } from './Modal/User.modal'

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.USER_CREATE,
        biz: 'admin',
        object: 'users'
    }
}

const UserAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [userInfo, setUserInfo] = useState(defaultUserModalAdd)
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)

    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleCreate(); saveContinue.current = true }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setUserInfo({ ...defaultUserModalAdd })
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleCreate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [userInfo.branch_id, userInfo.username, userInfo.user_id, userInfo.user_pass, userInfo.user_email, userInfo.user_phone];
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultAddUser, true, handleTimeOut)
    }

    const handleResultAddUser = (reqInfoMap, message) => {
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
            setUserInfo({ ...defaultUserModalAdd })
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (step1Ref.current) step1Ref.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    const checkValidate = () => {
        if (!!userInfo.username.trim() && !!userInfo.user_id.trim() && !!userInfo.user_pass.trim() && !!userInfo.user_email.trim()) {
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
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={shouldOpenModal}
            >
                <Card>
                    <CardHeader title={t('user.addUser')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth={true}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('user.userName')}
                                    name='username'
                                    onChange={handleChange}
                                    value={userInfo.username}
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
                                    label={t('user.userID')}
                                    onChange={handleChange}
                                    name='user_id'
                                    value={userInfo.user_id || ''}
                                    variant="outlined"
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('user.userPass')}
                                    onChange={handleChange}
                                    name='user_pass'
                                    value={userInfo.user_pass || ''}
                                    variant="outlined"
                                    inputRef={step3Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step4Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('user.userEmail')}
                                    onChange={handleChange}
                                    name='user_email'
                                    value={userInfo.user_email || ''}
                                    variant="outlined"
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('user.userPhone')}
                                    onChange={handleChange}
                                    name='user_phone'
                                    value={userInfo.user_phone || ''}
                                    variant="outlined"
                                    inputRef={step6Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                setShouldOpenModal(false)
                                setUserInfo({ ...defaultUserModalAdd })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleCreate()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('btn.save')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                saveContinue.current = true
                                handleCreate()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog >
        </>
    )
}

export default UserAdd