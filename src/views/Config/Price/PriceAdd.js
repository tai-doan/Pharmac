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

    const handleCreate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [Price.product, Price.unit, Price.importPrice, Price.importVAT, Price.price, Price.wholePrice, Price.exportVAT, Price.note || ''];
        sendRequest(serviceInfo.CREATE, inputParam, handleResultCreate, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const handleResultCreate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
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

    const checkValidate = () => {
        if (!!Price.product && !!Price.unit && !!Price.importPrice && Price.importPrice > 0 && Price.importVAT <= 100 && Price.importVAT >= 0 &&
            !!Price.price && Price.price > 0 && !!Price.wholePrice && Price.wholePrice > 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0) {
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