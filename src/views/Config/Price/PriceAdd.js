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
        reqFunct: reqFunction.PRICE_CREATE,
        biz: 'common',
        object: 'setup_price'
    }
}

const PriceAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [Price, setPrice] = useState({})
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
        setShouldOpenModal(false)
        setPrice({})
        setUnitSelect('')
        setProductSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const priceSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.PRICE_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            priceSub.unsubscribe()
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
            setPrice({})
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
        if (!Price.product || !Price.unit || !Price.importPrice || Price.importPrice <= 0 || !Price.importVAT || Price.importVAT <= 0 ||
            !Price.price || Price.price <= 0 || !Price.wholePrice || Price.wholePrice <= 0 || !Price.exportVAT || Price.exportVAT <= 0) return
        setProcess(true)
        const inputParam = [Price.product, Price.unit, Price.importPrice, Price.importVAT, Price.price, Price.wholePrice, Price.exportVAT, Price.note || ''];
        sendRequest(serviceInfo.CREATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!Price.product && !!Price.unit && !!Price.importPrice && Price.importPrice > 0 && !!Price.importVAT && Price.importVAT > 0 &&
            !!Price.price && Price.price > 0 && !!Price.wholePrice && Price.wholePrice > 0 && !!Price.exportVAT && Price.exportVAT > 0) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newPrice = { ...Price };
        newPrice['product'] = !!obj ? obj?.o_1 : null
        setProductSelect(!!obj ? obj?.o_2 : '')
        setPrice(newPrice)
    }

    const handleSelectUnit = obj => {
        const newPrice = { ...Price };
        newPrice['unit'] = !!obj ? obj?.o_1 : null
        setUnitSelect(!!obj ? obj?.o_2 : '')
        setPrice(newPrice)
    }

    const handleChange = e => {
        const newPrice = { ...Price };
        newPrice[e.target.name] = e.target.value
        setPrice(newPrice)
    }

    const handleImportPriceChange = value => {
        const newPrice = { ...Price };
        newPrice['importPrice'] = Number(value.value)
        setPrice(newPrice)
    }
    const handleImportVATChange = value => {
        const newPrice = { ...Price };
        newPrice['importVAT'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        setPrice(newPrice)
    }
    const handlePriceChange = value => {
        const newPrice = { ...Price };
        newPrice['price'] = Number(value.value)
        setPrice(newPrice)
    }
    const handleWholePriceChange = value => {
        const newPrice = { ...Price };
        newPrice['wholePrice'] = Number(value.value)
        setPrice(newPrice)
    }

    const handleExportVATChange = value => {
        const newPrice = { ...Price };
        newPrice['exportVAT'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        console.log(newPrice)
        setPrice(newPrice)
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
                    setPrice({})
                    setProductSelect('')
                    setUnitSelect('')
                }}
            >
                <Card>
                    <CardHeader title={t('config.price.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                                <Product_Autocomplete
                                    autoFocus={true}
                                    value={productSelect}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Unit_Autocomplete
                                    value={unitSelect}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <NumberFormat className='inputNumber' 
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.importPrice || ''}
                                    label={t('config.price.importPrice')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handleImportPriceChange}
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
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <NumberFormat className='inputNumber' 
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.importVAT || ''}
                                    label={t('config.price.importVAT')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    suffix="%"
                                    thousandSeparator={true}
                                    onValueChange={handleImportVATChange}
                                    inputProps={{
                                        min: 0,
                                        max: 100
                                    }}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat className='inputNumber' 
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.price || ''}
                                    label={t('config.price.price')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handlePriceChange}
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
                                <NumberFormat className='inputNumber' 
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.wholePrice || ''}
                                    label={t('config.price.wholePrice')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handleWholePriceChange}
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
                                <NumberFormat className='inputNumber' 
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.exportVAT || ''}
                                    label={t('config.price.exportVAT')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    suffix="%"
                                    thousandSeparator={true}
                                    onValueChange={handleExportVATChange}
                                    inputProps={{
                                        min: 0,
                                        max: 100
                                    }}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={2}
                                autoComplete="off"
                                label={t('config.price.note')}
                                onChange={handleChange}
                                value={Price.note || ''}
                                name='note'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleCreate()
                                    }
                                }}
                            />
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setShouldOpenModal(false);
                                setPrice({})
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
                                saveContinue.current = true
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

export default PriceAdd