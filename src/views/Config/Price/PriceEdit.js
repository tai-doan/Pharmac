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
import { config } from './Modal/Price.modal'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_PRICE_BY_ID: {
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

const PriceEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [Price, setPrice] = useState({})
    const [unitSelect, setUnitSelect] = useState('')
    const [process, setProcess] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setPrice({})
        setUnitSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && !!id && id !== 0) {
            setPrice({})
            setUnitSelect('')
            sendRequest(serviceInfo.GET_PRICE_BY_ID, [id], handleResultGetPriceByID, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    const handleResultGetPriceByID = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setPrice(newData.rows[0])
            setUnitSelect(newData.rows[0].o_5)
            step4Ref.current.focus()
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
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [Price.o_1, Price.o_4, Price.o_6, Price.o_7, Price.o_8, Price.o_9, Price.o_10, Price.o_11 || ''];
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const checkValidate = () => {
        if (!!Price.o_1 && !!Price.o_2 && !!Price.o_4 && !!Price.o_6 && Price.o_6 > 0 && Price.o_7 <= 100 && Price.o_7 >= 0 &&
            Price.o_8 > 0 && !!Price.o_9 && Price.o_9 > 0 && Price.o_10 <= 100 && Price.o_10 > 0) {
            return false
        }
        return true
    }

    const handleSelectUnit = obj => {
        const newPrice = { ...Price };
        newPrice['o_4'] = !!obj ? obj?.o_1 : null
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
        newPrice['o_6'] = Number(obj.value)
        setPrice(newPrice)
    }
    const handleImportVATChange = obj => {
        const newPrice = { ...Price };
        newPrice['o_7'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }
    const handlePriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['o_8'] = Number(obj.value)
        setPrice(newPrice)
    }
    const handleWholePriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['o_9'] = Number(obj.value)
        setPrice(newPrice)
    }

    const handleExportVATChange = obj => {
        const newPrice = { ...Price };
        newPrice['o_10'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }

    return (
        <Dialog
            // fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            // onClose={e => {
            //     setShouldOpenModal(false)
            // }}
        >
            <Card>
                <CardHeader title={t('config.price.titleEdit', { name: Price.o_3 })} />
                <CardContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <Product_Autocomplete
                                disabled={true}
                                value={Price.o_3}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Unit_Autocomplete
                                value={unitSelect}
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
                        <Grid item xs={6} sm={4}>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={Price.o_6}
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
                                inputRef={step2Ref}
                                onFocus={e => e.target.select()}
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
                                value={Price.o_7}
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
                                inputRef={step3Ref}
                                onFocus={e => e.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step4Ref.current.focus()
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
                                value={Price.o_8}
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
                                inputRef={step4Ref}
                                onFocus={e => e.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step5Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={Price.o_9}
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
                                value={Price.o_10}
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
                                inputRef={step6Ref}
                                onFocus={e => e.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step7Ref.current.focus()
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
                            value={Price.o_11 || ''}
                            name='o_11'
                            variant="outlined"
                            inputRef={step7Ref}
                            onFocus={e => e.target.select()}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    handleUpdate()
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
                            setPrice({})
                            setUnitSelect('')
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

export default PriceEdit