import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@material-ui/core'
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete'
import { productExportRepayModal } from '../Modal/ExportRepay.modal'
import NumberFormat from 'react-number-format'

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import SnackBarService from '../../../../utils/service/snackbar_service'
import { requestInfo } from '../../../../utils/models/requestInfo'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'
import { useHotkeys } from 'react-hotkeys-hook'
import LotNoByProduct_Autocomplete from '../../../../components/LotNoByProduct'
import LoopIcon from '@material-ui/icons/Loop'

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_BY_ID,
        biz: 'export',
        object: 'exp_repay_dt'
    },
    UPDATE_PRODUCT_TO_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_UPDATE,
        biz: 'export',
        object: 'exp_repay_dt'
    }
}

const EditProductRows = ({ productEditID, invoiceID, onRefresh, setProductEditID }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportRepayModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productExportRepayModal }); setProductEditID(-1) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (productEditID !== -1) {
            sendRequest(serviceInfo.GET_PRODUCT_BY_ID, [productEditID], handleResultGetProductInfo, true, handleTimeOut)
            setShouldOpenModal(true)
        }
    }, [productEditID])

    const handleResultGetProductInfo = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            const dataConvert = {
                prod_id: newData.rows[0].o_2,
                prod_nm: newData.rows[0].o_3,
                lot_no: newData.rows[0].o_4,
                qty: newData.rows[0].o_5,
                unit_id: newData.rows[0].o_6,
                unit_nm: newData.rows[0].o_7,
                price: newData.rows[0].o_8,
                discount_per: newData.rows[0].o_9,
                vat_per: newData.rows[0].o_10
            }
            setProductInfo(dataConvert)
            stepOneRef.current.focus()
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleUpdate = () => {
        if (productInfo.price < 0 || productInfo.qty <= 0 || productInfo.vat_per < 0 || productInfo.vat_per > 100 || productInfo.discount_per < 0 || productInfo.discount_per > 100) return
        setProcess(true)
        const inputParam = [
            invoiceID,
            productEditID,
            productInfo.qty,
            productInfo.price,
            productInfo.vat_per,
            productInfo.discount_per
        ]
        setControlTimeOutKey(serviceInfo.UPDATE_PRODUCT_TO_INVOICE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE_PRODUCT_TO_INVOICE, inputParam, handleResultUpdateProduct, true, handleTimeOut)
    }

    const handleResultUpdateProduct = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            // createSettlement()
            onRefresh()
            setShouldOpenModal(false)
            setProductInfo({ ...productExportRepayModal })
            setProductEditID(-1)
        }
    }

    const handleSelectLotNo = object => {
        const newProductInfo = { ...productInfo };
        newProductInfo['quantity_in_stock'] = !!object ? object.o_5 : null
        setProductInfo(newProductInfo)
    }

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        setProductInfo(newProductInfo)
    }

    const handleSelectUnit = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
        setProductInfo(newProductInfo)
    }

    const handleChange = e => {
        const newProductInfo = { ...productInfo };
        newProductInfo[e.target.name] = e.target.value
        setProductInfo(newProductInfo)
    }

    const handleQuantityChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['qty'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['price'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handleDiscountChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['discount_per'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        setProductInfo(newProductInfo)
    }

    const handleVATChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['vat_per'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        setProductInfo(newProductInfo)
    }

    const checkValidate = () => {
        if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id && productInfo.price >= 0 &&
            productInfo.discount_per >= 0 && productInfo.discount_per <= 100 && productInfo.vat_per >= 0 && productInfo.vat_per <= 100) {
            return false
        }
        return true
    }

    return (
        <>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                // onClose={e => {
                //     setProductInfo({ ...productExportRepayModal })
                //     setShouldOpenModal(false)
                //     setProductEditID(-1)
                // }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t('order.exportRepay.productEdit')}
                </DialogTitle>
                <DialogContent className="pt-0">
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <Product_Autocomplete
                                disabled={true}
                                productID={productInfo.prod_id}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                                onSelect={handleSelectProduct}
                            />
                        </Grid>
                        <Grid item xs>
                            <LotNoByProduct_Autocomplete
                                disabled={true}
                                productID={productInfo.prod_id}
                                value={productInfo.lot_no || ''}
                                label={t('order.export.lot_no')}
                                onSelect={handleSelectLotNo}
                            />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                disabled={true}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                required
                                label={t('product.store_current')}
                                value={productInfo.quantity_in_stock || ''}
                                name='quantity_in_stock'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.qty}
                                label={t('order.exportRepay.qty')}
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
                                onFocus={e => e.target.select()}
                                inputRef={stepOneRef}
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
                                unitID={productInfo.unit_id || null}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.price}
                                label={t('order.exportRepay.price')}
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
                                onFocus={e => e.target.select()}
                                inputRef={stepTwoRef}
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
                                label={t('order.exportRepay.discount_per')}
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
                                onFocus={e => e.target.select()}
                                inputRef={stepThreeRef}
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
                                label={t('order.exportRepay.vat_per')}
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
                                onFocus={e => e.target.select()}
                                inputRef={stepFourRef}
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
                    <Button size='small'
                        onClick={e => {
                            if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                return
                            }
                            setProductInfo({ ...productExportRepayModal })
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
                        {t('btn.update')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default EditProductRows;
