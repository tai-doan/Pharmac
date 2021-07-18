import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import NumberFormat from 'react-number-format'
import { Card, CardHeader, CardContent, CardActions, Chip, Grid, Button, TextField, Dialog } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../Unit/Control/Unit.Autocomplete'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import AddIcon from '@material-ui/icons/Add';
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.STORE_LIMIT_CREATE,
        biz: 'common',
        object: 'store_limit'
    }
}

const StoreLimitAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [StoreLimit, setStoreLimit] = useState({})
    const [productSelect, setProductSelect] = useState('')
    const [unitSelect, setUnitSelect] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const inputRef = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleCreate(); saveContinue.current = true }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false);
        setStoreLimit({})
        setProductSelect('')
        setUnitSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const storeLimitSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.STORE_LIMIT_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            storeLimitSub.unsubscribe()
        }
    }, [])

    const resultCreate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setStoreLimit({})
            setProductSelect('')
            setUnitSelect('')
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
        setProcess(false)
    }

    const handleCreate = () => {
        if (!StoreLimit.product || !StoreLimit.unit || !StoreLimit.minQuantity || StoreLimit.minQuantity <= 0 || !StoreLimit.maxQuantity || StoreLimit.maxQuantity <= 0) return
        setProcess(true)
        const inputParam = [StoreLimit.product, StoreLimit.unit, Number(StoreLimit.minQuantity), Number(StoreLimit.maxQuantity)]
        sendRequest(serviceInfo.CREATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!StoreLimit.product && !!StoreLimit.unit && !!StoreLimit.minQuantity && !!StoreLimit.maxQuantity) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['product'] = !!obj ? obj?.o_1 : null
        setProductSelect(!!obj ? obj?.o_2 : '')
        setStoreLimit(newStoreLimit)
    }

    const handleSelectUnit = obj => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['unit'] = !!obj ? obj?.o_1 : null
        setUnitSelect(!!obj ? obj?.o_2 : '')
        setStoreLimit(newStoreLimit)
    }

    const handleMinQuantityChange = value => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['minQuantity'] = Math.round(value.floatValue)
        setStoreLimit(newStoreLimit)
    }
    const handleMaxQuantityChange = value => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['maxQuantity'] = Math.round(value.floatValue)
        setStoreLimit(newStoreLimit)
    }

    return (
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setStoreLimit({})
                    setProductSelect('')
                    setUnitSelect('')
                }}
            >
                <Card>
                    <CardHeader title={t('config.store_limit.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <Product_Autocomplete
                                    autoFocus={true}
                                    value={productSelect}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
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
                                    value={StoreLimit.minQuantity}
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
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
                                    style={{ width: '100%' }}
                                    required
                                    value={StoreLimit.maxQuantity}
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
                                setShouldOpenModal(false);
                                setStoreLimit({})
                                setProductSelect('')
                                setUnitSelect('')
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleCreate();
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
                                saveContinue.current = true;
                                handleCreate();
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('config.save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog >
        </>
    )
}

export default StoreLimitAdd