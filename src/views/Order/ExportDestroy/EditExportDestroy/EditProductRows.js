import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete'
import { productExportDestroyModal } from '../Modal/ExportDestroy.modal'
import NumberFormat from 'react-number-format'

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import SnackBarService from '../../../../utils/service/snackbar_service'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'
import { useHotkeys } from 'react-hotkeys-hook'
import LotNoByProduct_Autocomplete from '../../../../components/LotNoByProduct'
import LoopIcon from '@material-ui/icons/Loop'

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PRODUCT_EXPORT_DESTROY_INVOICE_BY_ID,
        biz: 'export',
        object: 'exp_destroy_dt'
    },
    UPDATE_PRODUCT_TO_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.PRODUCT_EXPORT_DESTROY_INVOICE_UPDATE,
        biz: 'export',
        object: 'exp_destroy_dt'
    }
}

const EditProductRows = ({ productEditID, invoiceID, onRefresh, setProductEditID }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportDestroyModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productExportDestroyModal }); setProductEditID(-1) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                prod_id: newData.rows[0].o_3,
                prod_nm: newData.rows[0].o_4,
                lot_no: newData.rows[0].o_5,
                qty: newData.rows[0].o_6,
                unit_id: newData.rows[0].o_7,
                unit_nm: newData.rows[0].o_8,
                price: newData.rows[0].o_9,
                reason_tp: newData.rows[0].o_10,
                reason_tp_nm: newData.rows[0].o_11
            }
            setProductInfo(dataConvert)
            stepOneRef.current.focus()
        }
    }

    const handleUpdate = () => {
        if (productInfo.price < 0 || productInfo.qty <= 0 || !!productInfo.reason_tp) return
        setProcess(true)
        const inputParam = [
            invoiceID,
            productEditID,
            productInfo.qty,
            productInfo.price,
            productInfo.reason_tp
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
            setProductInfo({ ...productExportDestroyModal })
            setProductEditID(-1)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleSelectLotNo = object => {
        const newProductInfo = { ...productInfo };
        newProductInfo['quantity_in_stock'] = !!object ? object.o_5 : null
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

    const checkValidate = () => {
        if (productInfo.qty > 0 && productInfo.price >= 0 && !!productInfo.reason_tp) {
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
                //     setProductInfo({ ...productExportDestroyModal })
                //     setShouldOpenModal(false)
                //     setProductEditID(-1)
                // }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t('order.exportDestroy.productEdit')}
                </DialogTitle>
                <DialogContent className="pt-0">
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <Product_Autocomplete
                                disabled={true}
                                value={productInfo.prod_nm}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
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
                                label={t('order.exportDestroy.qty')}
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
                                value={productInfo.unit_nm || ''}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={productInfo.price}
                                label={t('order.exportDestroy.price')}
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
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="reason_tp">{t('order.exportDestroy.reason_tp')}</InputLabel>
                                <Select
                                    labelId="reason_tp"
                                    id="reason_tp-select"
                                    value={productInfo.reason_tp || '1'}
                                    onChange={handleChange}
                                    label={t('order.exportDestroy.reason_tp')}
                                    name='reason_tp'
                                >
                                    <MenuItem value="1">{t('order.exportDestroy.cancel_by_out_of_date')}</MenuItem>
                                    <MenuItem value="2">{t('order.exportDestroy.cancel_by_lost_goods')}</MenuItem>
                                    <MenuItem value="3">{t('order.exportDestroy.cancel_by_inventory_balance')}</MenuItem>
                                    <MenuItem value="4">{t('other_reason')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button size='small'
                        onClick={e => {
                            if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                return
                            }
                            setProductInfo({ ...productExportDestroyModal })
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
