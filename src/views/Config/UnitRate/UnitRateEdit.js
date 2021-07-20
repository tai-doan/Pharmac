import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import NumberFormat from 'react-number-format'
import { useHotkeys } from 'react-hotkeys-hook'
import { Card, CardHeader, CardContent, CardActions, Grid, Button, TextField, Dialog } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../Unit/Control/Unit.Autocomplete'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import { config } from './Modal/UnitRate.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_UNIT_RATE_BY_ID: {
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

const UnitRateEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [unitRate, setUnitRate] = useState({})
    const [process, setProcess] = useState(false)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setUnitRate({}) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const unitRateSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.UNIT_RATE_BY_ID:
                        resultGetUnitRateByID(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.UNIT_RATE_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            unitRateSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            setUnitRate({})
            sendRequest(serviceInfo.GET_UNIT_RATE_BY_ID, [id], null, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    const resultGetUnitRateByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setUnitRate(newData.rows[0])
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
        if (!unitRate.o_1 || !unitRate.o_6 || unitRate.o_6 <= 0) return
        setProcess(true)
        const inputParam = [unitRate.o_1, unitRate.o_6];
        sendRequest(serviceInfo.UPDATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const checkValidate = () => {
        if (unitRate.o_6 && unitRate.o_6 > 0) {
            return false
        }
        return true
    }

    const handleChange = value => {
        const newUnitRate = { ...unitRate };
        newUnitRate['o_6'] = Number(value.value)
        setUnitRate(newUnitRate)
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
                <CardHeader title={t('config.unitRate.titleEdit', { name: unitRate.o_3 })} />
                <CardContent>
                    <Grid container className="{}" spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <Product_Autocomplete
                                disabled={true}
                                value={unitRate.o_3}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Unit_Autocomplete
                                disabled={true}
                                value={unitRate.o_5}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={unitRate.o_6}
                                autoFocus={true}
                                label={t('config.unitRate.rate')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                onValueChange={handleChange}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            setShouldOpenModal(false);
                            setUnitRate({})
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

export default UnitRateEdit