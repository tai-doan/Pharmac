import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { Card, CardHeader, CardContent, CardActions, Dialog, TextField, Button, Grid } from '@material-ui/core'
import NumberFormat from 'react-number-format'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../Unit/Control/Unit.Autocomplete'

import SnackBarService from '../../../utils/service/snackbar_service'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/StoreLimit.modal'
import { requestInfo } from '../../../utils/models/requestInfo'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_STORE_LIMIT_BY_ID: {
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

const StoreLimitEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [StoreLimit, setStoreLimit] = useState({})
    const [unitSelect, setUnitSelect] = useState('')
    const [process, setProcess] = useState(false)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setStoreLimit({})
        setUnitSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const StoreLimitSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.STORE_LIMIT_BY_ID:
                        resultGetStoreLimitByID(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.STORE_LIMIT_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            StoreLimitSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal && !!id && id !== 0) {
            setStoreLimit({})
            setUnitSelect('')
            sendRequest(serviceInfo.GET_STORE_LIMIT_BY_ID, [id], null, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    const resultGetStoreLimitByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setStoreLimit(newData.rows[0])
            setUnitSelect(newData.rows[0].o_5)
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
        if (!StoreLimit.o_1 || !StoreLimit.o_4 || !StoreLimit.o_6 || StoreLimit.o_6 <= 0 || !StoreLimit.o_7 || StoreLimit.o_7 <= 0) return
        setProcess(true)
        const inputParam = [StoreLimit.o_1, StoreLimit.o_4, StoreLimit.o_6, StoreLimit.o_7];
        sendRequest(serviceInfo.UPDATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const checkValidate = () => {
        if (!!StoreLimit.o_1 && !!StoreLimit.o_4 && !!StoreLimit.o_6 && !!StoreLimit.o_7) {
            return false
        }
        return true
    }

    const handleSelectUnit = obj => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['o_4'] = !!obj ? obj?.o_1 : null
        setUnitSelect(!!obj ? obj?.o_2 : '')
        setStoreLimit(newStoreLimit)
    }

    const handleMinQuantityChange = value => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['o_6'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        setStoreLimit(newStoreLimit)
    }
    const handleMaxQuantityChange = value => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['o_7'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 1000
        setStoreLimit(newStoreLimit)
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
                <CardHeader title={t('config.store_limit.titleEdit', { name: StoreLimit.o_3 })} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <Product_Autocomplete
                                disabled={true}
                                value={StoreLimit.o_3}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                            />
                        </Grid>
                        <Grid item xs>
                            <Unit_Autocomplete
                                value={unitSelect}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                autoFocus={true}
                                value={StoreLimit.o_6}
                                label={t('config.store_limit.minQuantity')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                onValueChange={handleMinQuantityChange}
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
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={StoreLimit.o_7}
                                label={t('config.store_limit.maxQuantity')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                onValueChange={handleMaxQuantityChange}
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
                    </Grid>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            setShouldOpenModal(false);
                            setStoreLimit({})
                            setUnitSelect('')
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleUpdate(StoreLimit);
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

export default StoreLimitEdit