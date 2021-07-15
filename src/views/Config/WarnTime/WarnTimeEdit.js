import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import NumberFormat from 'react-number-format'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/WarnTime.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import Dictionary from '../../../components/Dictionary/index'
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

const serviceInfo = {
    GET_WARN_TIME_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const WarnTimeEdit = ({ id, shouldOpenEditModal, handleCloseEditModal, handleUpdate }) => {
    const { t } = useTranslation()

    const [warnTime, setWarnTime] = useState({})

    useHotkeys('f3', () => handleUpdate(warnTime), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => handleCloseEditModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                if (reqInfoMap.reqFunct === reqFunction.WARN_TIME_BY_ID) {
                    resultGetWarnTimeByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            warnTimeSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            console.log('id? ', id)
            sendRequest(serviceInfo.GET_WARN_TIME_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

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
            console.log('data: ', newData)
            setWarnTime(newData.rows[0])
        }
    }

    const checkValidate = () => {
        if (!!warnTime?.o_1 && !!warnTime?.o_2 && !!warnTime?.o_4 && !!warnTime?.o_5) {
            return false
        }
        return true
    }

    const handleChangeAmt = value => {
        const newWarnTime = { ...warnTime };
        newWarnTime['o_4'] = Math.round(value.floatValue)
        setWarnTime(newWarnTime)
    }

    const handleChangeTimeTp = obj => {
        const newWarnTime = { ...warnTime };
        newWarnTime['o_5'] = !!obj ? obj?.o_1 : null
        setWarnTime(newWarnTime)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenEditModal}
            onClose={e => {
                handleCloseEditModal(false)
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
                            handleCloseEditModal(false);
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
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default WarnTimeEdit