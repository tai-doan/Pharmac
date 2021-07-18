import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { useHotkeys } from 'react-hotkeys-hook'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

const serviceInfo = {
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.MOD_UNIT,
        biz: 'common',
        object: 'units'
    },
    GET_UNIT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.GET_UNIT,
        biz: 'common',
        object: 'units'
    }
}

const UnitEdit = ({ id, onRefresh, shouldOpenModal, setShouldOpenModal }) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setName(''); setNote('') }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                    case reqFunction.MOD_UNIT:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.GET_UNIT:
                        resultGetUnitByID(msg, cltSeqResult, reqInfoMap)
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

    useEffect(() => {
        if (id && id !== 0) {
            sendRequest(serviceInfo.GET_UNIT_BY_ID, [id], null, true, handleTimeOut)
        }
    }, [id])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const resultGetUnitByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setName(newData.rows[0].o_2)
            setNote(newData.rows[0].o_3)
        }
    }

    const resultUpdate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        const inputParam = [id, name, note];
        sendRequest(serviceInfo.UPDATE, inputParam, null, true, handleTimeOut)
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
                <CardHeader title={t(id === 0 ? 'config.unit.titleAdd' : 'config.unit.titleEdit', { name: name })} />
                <CardContent>
                    <TextField
                        fullWidth={true}
                        required
                        autoFocus
                        autoComplete="off"
                        margin="dense"
                        label={t('config.unit.name')}
                        onChange={handleChangeName}
                        value={name}
                        variant="outlined"
                        className="uppercaseInput"
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                handleUpdate()
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
                                handleUpdate()
                            }
                        }}
                    />
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            setShouldOpenModal(false);
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
                            handleUpdate();
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.update')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default UnitEdit