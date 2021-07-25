import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, InputLabel, MenuItem, FormControl, Select, FormControlLabel, Checkbox } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete'
import { productImportModal } from '../Modal/Import.modal'
import NumberFormat from 'react-number-format'
import moment from 'moment'

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import SnackBarService from '../../../../utils/service/snackbar_service'
import { requestInfo } from '../../../../utils/models/requestInfo'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'
import { useHotkeys } from 'react-hotkeys-hook'
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    UPDATE_PRODUCT_TO_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_UPDATE,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    CREATE_SETTLEMENT_BY_PRODUCT: {
        functionName: 'insert',
        reqFunct: reqFunction.SETTLEMENT_IMPORT_CREATE,
        biz: 'settlement',
        object: 'imp_settl'
    }
}

const EditProductRows = ({ productEditID, invoiceID, onRefresh, setProductEditID }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productImportModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [checked, setChecked] = useState(true)
    const [process, setProcess] = useState(false)

    const productInfoPrev = useRef(productImportModal)
    const productInfoCurr = useRef(productImportModal)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo(productImportModal); setProductEditID(-1) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (productEditID !== -1) {
            sendRequest(serviceInfo.GET_PRODUCT_BY_ID, [productEditID], handleResultGetProductInfo, true, handleTimeOut)
            setShouldOpenModal(true)
        }
    }, [productEditID])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const handleResultGetProductInfo = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            const dataConvert = {
                invoice_id: newData.rows[0].o_2,
                imp_tp: newData.rows[0].o_3,
                prod_id: newData.rows[0].o_5,
                prod_nm: newData.rows[0].o_6,
                lot_no: newData.rows[0].o_7,
                made_dt: newData.rows[0].o_8,
                exp_dt: moment(newData.rows[0].o_9, 'YYYYMMDD').toString(),
                qty: newData.rows[0].o_10,
                unit_id: newData.rows[0].o_11,
                unit_nm: newData.rows[0].o_12,
                price: newData.rows[0].o_13,
                vat_per: newData.rows[0].o_14,
                discount_per: newData.rows[0].o_15
            }
            productInfoPrev.current = dataConvert
            setProductInfo(dataConvert)
            stepOneRef.current.focus()
        }
    }

    const resultCreateSettlement = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        console.log('create settlement result: ', reqInfoMap, message)
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
        }
    }

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handleSelectUnit = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handleChange = e => {
        const newProductInfo = { ...productInfo };
        newProductInfo[e.target.name] = e.target.value
        if (e.target.name === 'imp_tp' && e.target.value === '2') {
            newProductInfo['discount_per'] = 0;
            newProductInfo['vat_per'] = 0;
            newProductInfo['price'] = 0;
            productInfoCurr.current = newProductInfo
            setProductInfo(newProductInfo)
        } else {
            productInfoCurr.current = newProductInfo
            setProductInfo(newProductInfo)
        }
    }

    const handleExpDateChange = date => {
        const newProductInfo = { ...productInfo };
        newProductInfo['exp_dt'] = date;
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handleQuantityChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['qty'] = Number(value.value)
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['price'] = Number(value.value)
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handleDiscountChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['discount_per'] = Number(value.value)
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handleVATChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['vat_per'] = Number(value.value)
        productInfoCurr.current = newProductInfo
        setProductInfo(newProductInfo)
    }

    const handleCheckedChange = e => {
        setChecked(e.target.checked)
    }

    const createSettlement = () => {
        console.log('Kiểm tra và tạo hđ công nợ')
        if (checked) {
            const oldTotalPaided = Math.round(
                (productInfoPrev.current.price * productInfoPrev.current.qty) * (1 - (productInfoPrev.current.discount_per / 100)) * (1 + (productInfoPrev.current.vat_per / 100))
            )
            const newTotalPaided = Math.round(
                (productInfoCurr.current.price * productInfoCurr.current.qty) * (1 - (productInfoCurr.current.discount_per / 100)) * (1 + (productInfoCurr.current.vat_per / 100))
            )
            if (oldTotalPaided > newTotalPaided) {
                const inputParams = ['11', invoiceID || productInfoPrev.current.invoice_id, '1', moment().format('YYYYMMDD'), oldTotalPaided - newTotalPaided, '', '', '', '', '', '', '',]
                sendRequest(serviceInfo.CREATE_SETTLEMENT_BY_PRODUCT, inputParams, null, true, handleTimeOut)
            } else if (oldTotalPaided < newTotalPaided) {
                const inputParams = ['10', invoiceID || productInfoPrev.current.invoice_id, '1', moment().format('YYYYMMDD'), newTotalPaided - oldTotalPaided, '', '', '', '', '', '', '',]
                sendRequest(serviceInfo.CREATE_SETTLEMENT_BY_PRODUCT, inputParams, null, true, handleTimeOut)
            }
        }
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [
            invoiceID,
            productEditID,
            productInfo.imp_tp,
            productInfo.qty,
            productInfo.price,
            productInfo.discount_per,
            productInfo.vat_per
        ]
        sendRequest(serviceInfo.UPDATE_PRODUCT_TO_INVOICE, inputParam, handleResultUpdateProduct, true, handleTimeOut)
    }

    const handleResultUpdateProduct = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            console.log('cập nhật sản phẩm thành công => ', message)
            // xử lý thành công
            // createSettlement()
            onRefresh()
            setShouldOpenModal(false)
            productInfoPrev.current = productImportModal
            setProductInfo({ ...productImportModal })
            setProductEditID(-1)
        }
    }

    const checkValidate = () => {
        if (!!productInfo.imp_tp && productInfo.imp_tp === '1') {
            if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id && productInfo.price >= 0 && productInfo.discount_per >= 0 && productInfo.discount_per <= 100 && productInfo.vat_per >= 0 && productInfo.vat_per <= 100) {
                return false
            } else
                return true
        } else {
            if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id) {
                return false
            }
            return true
        }
    }

    return (
        <>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setProductInfo({ ...productImportModal })
                    setShouldOpenModal(false)
                    setProductEditID(-1)
                }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t('order.import.productEdit')}
                </DialogTitle>
                <DialogContent className="pt-0">
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="import_type">{t('order.import.import_type')}</InputLabel>
                                <Select
                                    labelId="import_type"
                                    id="import_type-select"
                                    value={productInfo.imp_tp || '1'}
                                    onChange={handleChange}
                                    label={t('order.import.import_type')}
                                    name='imp_tp'
                                >
                                    <MenuItem value="1">{t('order.import.import_type_buy')}</MenuItem>
                                    <MenuItem value="2">{t('order.import.import_type_selloff')}</MenuItem>
                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item xs>
                            <Product_Autocomplete
                                disabled={true}
                                value={productInfo.prod_nm}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                                onSelect={handleSelectProduct}
                            />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                disabled={true}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                required
                                label={t('order.import.lot_no')}
                                onChange={handleChange}
                                value={productInfo.lot_no || ''}
                                name='lot_no'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disabled={true}
                                    disableToolbar
                                    margin="dense"
                                    variant="outlined"
                                    style={{ width: '100%' }}
                                    inputVariant="outlined"
                                    format="dd/MM/yyyy"
                                    id="exp_dt-picker-inline"
                                    label={t('order.import.exp_dt')}
                                    value={productInfo.exp_dt}
                                    onChange={handleExpDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.qty}
                                label={t('order.import.qty')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                onValueChange={handleQuantityChange}
                                inputProps={{
                                    min: 0,
                                }}
                                inputRef={stepOneRef}
                                onFocus={(event) => event.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        stepTwoRef.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <Unit_Autocomplete
                                disabled={true}
                                value={productInfo.unit_nm || ''}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                            />
                        </Grid>

                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.price}
                                label={t('order.import.price')}
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
                                inputRef={stepTwoRef}
                                onFocus={(event) => event.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        stepThreeRef.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.discount_per}
                                label={t('order.import.discount_per')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                suffix="%"
                                thousandSeparator={true}
                                onValueChange={handleDiscountChange}
                                inputProps={{
                                    min: 0,
                                    max: 100
                                }}
                                inputRef={stepThreeRef}
                                onFocus={(event) => event.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        stepFourRef.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.vat_per}
                                label={t('order.import.vat_per')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                suffix="%"
                                thousandSeparator={true}
                                onValueChange={handleVATChange}
                                inputProps={{
                                    min: 0,
                                    max: 100
                                }}
                                inputRef={stepFourRef}
                                onFocus={(event) => event.target.select()}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    {/* <FormControlLabel
                        control={<Checkbox checked={checked} onChange={handleCheckedChange} name="auto_update" />}
                        label={t('auto_update')}
                    /> */}
                    <Button size='small'
                        onClick={e => {
                            setProductInfo({ ...productImportModal })
                            setShouldOpenModal(false)
                            setProductEditID(-1)
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleUpdate()
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                        endIcon={process && <LoopIcon />}
                    >
                        {t('btn.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default EditProductRows;
