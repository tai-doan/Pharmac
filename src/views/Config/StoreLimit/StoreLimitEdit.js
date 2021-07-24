import React, { useState, useEffect, useRef } from 'react'
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
import { config } from './Modal/StoreLimit.modal'

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
    const [process, setProcess] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setStoreLimit({})
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && !!id && id !== 0) {
            setStoreLimit({})
            sendRequest(serviceInfo.GET_STORE_LIMIT_BY_ID, [id], handleResultGetStoreLimitByID, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    const handleResultGetStoreLimitByID = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setStoreLimit(newData.rows[0])
        }
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
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [StoreLimit.o_1, StoreLimit.o_4, StoreLimit.o_6, StoreLimit.o_7];
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const checkValidate = () => {
        if (!!StoreLimit.o_1 && !!StoreLimit.o_4 && StoreLimit.o_6 > -1 && StoreLimit.o_7 > -1) {
            return false
        }
        return true
    }

    const handleSelectUnit = obj => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['o_4'] = !!obj ? obj?.o_1 : null
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
            maxWidth="sm"
            open={shouldOpenModal}
            onClose={e => {
                setShouldOpenModal(false)
            }}
        >
            <Card>
                <CardHeader title={t('config.store_limit.titleEdit', { name: StoreLimit.o_3 })} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Product_Autocomplete
                                disabled={true}
                                value={StoreLimit.o_3}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Unit_Autocomplete
                                value={StoreLimit.o_5 || ''}
                                // unitID={StoreLimit.o_5 || null}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                                inputRef={step1Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step2Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberFormat className='inputNumber'
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
                                inputRef={step2Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step3Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberFormat className='inputNumber'
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
                            setStoreLimit({})
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