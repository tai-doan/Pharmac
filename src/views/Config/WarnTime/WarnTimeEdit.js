import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { Card, CardHeader, CardContent, CardActions, Dialog, TextField, Button, Grid } from '@material-ui/core'
import NumberFormat from 'react-number-format'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Dictionary from '../../../components/Dictionary/index'

import SnackBarService from '../../../utils/service/snackbar_service'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { requestInfo } from '../../../utils/models/requestInfo'
import { config } from './Modal/WarnTime.modal'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_WARN_TIME_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    UPDATE: {
        functionName: config['update'].functionName,
        reqFunct: config['update'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const WarnTimeEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [warnTime, setWarnTime] = useState({})
    const [process, setProcess] = useState(false)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setWarnTime({})
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const warnTimeSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.WARN_TIME_BY_ID:
                        resultGetWarnTimeByID(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.WARN_TIME_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            warnTimeSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            setWarnTime({})
            sendRequest(serviceInfo.GET_WARN_TIME_BY_ID, [id], null, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    const resultGetWarnTimeByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setWarnTime(newData.rows[0])
        }
    }

    const resultUpdate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (!warnTime.o_1 || !warnTime.o_4 || warnTime.o_4 <= 0 || !warnTime.o_5) return
        setProcess(true)
        const inputParam = [warnTime.o_1, warnTime.o_4, warnTime.o_5];
        sendRequest(serviceInfo.UPDATE, inputParam, null, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const checkValidate = () => {
        if (!!warnTime?.o_1 && !!warnTime?.o_4 && warnTime.o_4 > 0 && !!warnTime?.o_5) {
            return false
        }
        return true
    }

    const handleChangeAmt = value => {
        const newWarnTime = { ...warnTime };
        newWarnTime['o_4'] = Number(value.value)
        setWarnTime(newWarnTime)
    }

    const handleChangeTimeTp = obj => {
        const newWarnTime = { ...warnTime };
        newWarnTime['o_5'] = !!obj ? obj?.o_1 : null
        newWarnTime['o_6'] = !!obj ? obj?.o_2 : ''
        setWarnTime(newWarnTime)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            onClose={e => {
                setShouldOpenModal(false)
            }}
        >
            <Card>
                <CardHeader title={t('config.warnTime.titleEdit', { name: warnTime?.o_3 })} />
                <CardContent>
                    <Grid container className="{}" spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <Product_Autocomplete
                                disabled={true}
                                value={warnTime?.o_3}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                autoFocus={true}
                                value={warnTime?.o_4}
                                label={t('config.warnTime.warn_amt')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                onValueChange={handleChangeAmt}
                                inputProps={{
                                    min: 0,
                                }}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Dictionary
                                value={warnTime.o_6 || ''}
                                diectionName='warn_time_tp'
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('config.warnTime.warn_time_tp')}
                                onSelect={handleChangeTimeTp}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            setShouldOpenModal(false);
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleUpdate(warnTime);
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

export default WarnTimeEdit