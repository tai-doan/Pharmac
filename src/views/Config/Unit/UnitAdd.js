import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip, Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'
import AddIcon from '@material-ui/icons/Add';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.INS_UNIT,
        biz: 'common',
        object: 'units'
    }
}

const UnitAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const saveContinue = useRef(false)
    const inputRef = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => submit(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { submit(); saveContinue.current = true }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => setShouldOpenModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
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
                    case reqFunction.INS_UNIT:
                        resultSubmit(msg, cltSeqResult, reqInfoMap)
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

    const resultSubmit = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            setName('')
            setNote('')
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (inputRef.current) inputRef.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const submit = () => {
        const inputParam = [name, note];
        sendRequest(serviceInfo.CREATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!name.trim()) {
            return false
        }
        return true
    }

    const handleChangeName = e => {
        setName(e.target.value);
    }

    const handleChangeNote = e => {
        setNote(e.target.value);
    }

    return (
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setNote('')
                    setName('')
                }}
            >
                <Card>
                    <CardHeader title={t('config.unit.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required
                            autoFocus
                            inputRef={inputRef}
                            autoComplete="off"
                            margin="dense"
                            label={t('config.unit.name')}
                            onChange={handleChangeName}
                            value={name}
                            variant="outlined"
                            className="uppercaseInput"
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    submit()
                                }
                            }}
                        />

                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('config.unit.note')}
                            onChange={handleChangeNote}
                            value={note || ''}
                            variant="outlined"
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    submit()
                                }
                            }}
                        />
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setShouldOpenModal(false)
                                setNote('')
                                setName('')
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                submit()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('btn.save')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                saveContinue.current = true
                                submit()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('config.save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog >
        </>
    )
}

export default UnitAdd