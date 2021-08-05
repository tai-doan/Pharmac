import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions, Grid } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.PHARMACY_UPDATE,
        biz: 'admin',
        object: 'pharmacy'
    },
    GET_PHARMACY_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PHARMACY_BY_ID,
        biz: 'admin',
        object: 'pharmacy'
    }
}

const PharmacyEdit = ({ id, onRefresh, shouldOpenModal, setShouldOpenModal }) => {
    const { t } = useTranslation()

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
    const [process, setProcess] = useState(false)

    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setPharmacyInfo({}) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [id], handleResultGetByID, true, handleTimeOut)
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
            if (step1Ref?.current) step1Ref.current.focus()
        }
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
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
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
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const checkValidate = () => {
        if (!!pharmacyInfo?.o_1 && !!pharmacyInfo?.o_2.trim() && !!pharmacyInfo?.o_5.trim() && !!pharmacyInfo?.o_6.trim() && !!pharmacyInfo?.o_7 &&
            !!pharmacyInfo?.o_8.trim() && !!pharmacyInfo.o_9.trim() && !!pharmacyInfo.o_10.trim() && !!pharmacyInfo.o_11.trim()) {
            return false
        }
        return true
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

    return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={shouldOpenModal}
        >
            <Card>
                <CardHeader title={t('pharmacy.updateTitle')} />
                <CardContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                                    value={pharmacyInfo.o_7}
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                return
                            }
                            setShouldOpenModal(false);
                            setPharmacyInfo({})
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

export default PharmacyEdit