import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import NumberFormat from 'react-number-format'
import { Card, CardHeader, CardContent, CardActions, Chip, Grid, Button, TextField, Dialog } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../Unit/Control/Unit.Autocomplete'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { priceDefaultModal } from './Modal/Price.modal'

import AddIcon from '@material-ui/icons/Add';
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRICE_CREATE,
        biz: 'common',
        object: 'setup_price'
    },
    GET_PRODUCT_INFO: {
        functionName: 'get_imp_info',
        reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
        biz: 'common',
        object: 'products'
    }
}

const PriceAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [Price, setPrice] = useState(priceDefaultModal)
    const [productSelect, setProductSelect] = useState('')
    const [unitSelect, setUnitSelect] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleCreate(); saveContinue.current = true }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setPrice({ ...priceDefaultModal })
        setUnitSelect('')
        setProductSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    const handleCreate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [Price.product, Price.unit, Price.importPrice, Price.importVAT, Price.price, Price.wholePrice, Price.exportVAT, Price.note || ''];
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultCreate, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleResultCreate = (reqInfoMap, message) => {
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
            setPrice({ ...priceDefaultModal })
            setProductSelect('')
            setUnitSelect('')
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (step1Ref.current) step1Ref.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    const checkValidate = () => {
        if (!!Price.product && !!Price.unit && Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0
            && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newPrice = { ...Price };
        newPrice['product'] = !!obj ? obj?.o_1 : null
        setProductSelect(!!obj ? obj?.o_2 : '')
        setPrice(newPrice)
        if (!!obj && !!obj.o_2) {
            sendRequest(serviceInfo.GET_PRODUCT_INFO, [obj.o_1], handleResultGetProductInfo, true, handleTimeOut)
        }
    }

    const handleResultGetProductInfo = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA']
            setPrice(prev => { return { ...prev, ...{ unit: data.rows[0]?.o_1 || null } } })
        }
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

    const handleImportPriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['importPrice'] = Number(obj.value)
        setPrice(newPrice)
    }
    const handleImportVATChange = obj => {
        const newPrice = { ...Price };
        newPrice['importVAT'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }
    const handlePriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['price'] = Number(obj.value)
        setPrice(newPrice)
    }
    const handleWholePriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['wholePrice'] = Number(obj.value)
        setPrice(newPrice)
    }

    const handleExportVATChange = obj => {
        const newPrice = { ...Price };
        newPrice['exportVAT'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }

    return (
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={false}
                maxWidth="md"
                open={shouldOpenModal}
                // onClose={e => {
                //     setShouldOpenModal(false)
                //     setPrice({ ...priceDefaultModal })
                // }}
            >
                <Card>
                    <CardHeader title={t('config.price.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={12}>
                                <Product_Autocomplete
                                    autoFocus={true}
                                    productID={Price.product || null}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                    inputRef={step1Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step2Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Unit_Autocomplete
                                    unitID={Price.unit || null}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.importPrice || 0}
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
                                    inputRef={step3Ref}
                                    onFocus={e => e.target.select()}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step4Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.importVAT || 0}
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
                                    inputRef={step4Ref}
                                    onFocus={e => e.target.select()}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item xs>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.price || 0}
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
                                    inputRef={step5Ref}
                                    onFocus={e => e.target.select()}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step6Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.wholePrice || 0}
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
                                    inputRef={step6Ref}
                                    onFocus={e => e.target.select()}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step7Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={Price.exportVAT || 0}
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
                                    inputRef={step7Ref}
                                    onFocus={e => e.target.select()}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step8Ref.current.focus()
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
                                rows={1}
                                rowsMax={5}
                                autoComplete="off"
                                label={t('config.price.note')}
                                onChange={handleChange}
                                value={Price.note || ''}
                                name='note'
                                variant="outlined"
                                inputRef={step8Ref}
                                onFocus={e => e.target.select()}
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
                                if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                    return
                                }
                                setShouldOpenModal(false);
                                setPrice({ ...priceDefaultModal })
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