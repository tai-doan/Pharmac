import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
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
    const [process, setProcess] = useState(false)

    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setName(''); setNote('') }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            sendRequest(serviceInfo.GET_UNIT_BY_ID, [id], handleResultGetByID, true, handleTimeOut)
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
            setName(newData.rows[0].o_2)
            setNote(newData.rows[0].o_3)
        }
    }

    const handleUpdate = () => {
        if (!id || id === 0 || !name || !name.trim()) return
        setProcess(true)
        const inputParam = [id, name, note];
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
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setName('')
            setNote('')
            setShouldOpenModal(false)
            onRefresh()
        }
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
            // onClose={e => {
            //     setShouldOpenModal(false)
            //     setNote('')
            //     setName('')
            // }}
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
                        inputRef={step1Ref}
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                step2Ref.current.focus()
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
                        inputRef={step2Ref}
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
                            if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                return
                            }
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

export default UnitEdit