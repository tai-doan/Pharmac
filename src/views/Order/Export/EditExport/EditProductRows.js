import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete'
import { productExportModal } from '../Modal/Export.modal'
import NumberFormat from 'react-number-format'

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import SnackBarService from '../../../../utils/service/snackbar_service'
import { requestInfo } from '../../../../utils/models/requestInfo'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'
import { useHotkeys } from 'react-hotkeys-hook'

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PRODUCT_EXPORT_INVOICE_BY_ID,
        biz: 'export',
        object: 'exp_invoices_dt'
    }
}

const EditProductRows = ({ productEditID, handleEditProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productExportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const productSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.PRODUCT_EXPORT_INVOICE_BY_ID:
                        resultGetProductByInvoiceID(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            productSub.unsubscribe();
        }
    }, [])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    useEffect(() => {
        if (productEditID !== -1) {
            sendRequest(serviceInfo.GET_PRODUCT_BY_ID, [productEditID], null, true, handleTimeOut)
            setShouldOpenModal(true)
        }
    }, [productEditID])

    const resultGetProductByInvoiceID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            let newData = message['PROC_DATA']
            const dataConvert = {
                exp_tp: newData.rows[0].o_2,
                prod_id: newData.rows[0].o_4,
                prod_nm: newData.rows[0].o_5,
                lot_no: newData.rows[0].o_6,
                qty: newData.rows[0].o_7,
                unit_id: newData.rows[0].o_8,
                unit_nm: newData.rows[0].o_9,
                price: newData.rows[0].o_10,
                vat_per: newData.rows[0].o_12,
                discount_per: newData.rows[0].o_11
            }
            setProductInfo(dataConvert)
        }
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
        if (e.target.name === 'exp_tp' && e.target.value !== '1') {
            newProductInfo['price'] = 0;
            newProductInfo['discount_per'] = 0
            newProductInfo['vat_per'] = 0
            setProductInfo(newProductInfo)
        } else {
            setProductInfo(newProductInfo)
        }
    }

    const handleQuantityChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['qty'] = Math.round(value.floatValue)
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['price'] = Math.round(value.floatValue)
        setProductInfo(newProductInfo)
    }

    const handleDiscountChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['discount_per'] = Math.round(value.floatValue) >= 0 && Math.round(value.floatValue) <= 100 ? Math.round(value.floatValue) : 10
        setProductInfo(newProductInfo)
    }

    const handleVATChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['vat_per'] = Math.round(value.floatValue) >= 0 && Math.round(value.floatValue) <= 100 ? Math.round(value.floatValue) : 10
        setProductInfo(newProductInfo)
    }

    const checkValidate = () => {
        if (!!productInfo.exp_tp && productInfo.exp_tp === '1') {
            if (!!productInfo.prod_id && !!productInfo.lot_no && !!productInfo.qty && !!productInfo.unit_id && !!productInfo.price && !!productInfo.discount_per && !!productInfo.vat_per) {
                return false
            } else
                return true
        } else {
            if (!!productInfo.prod_id && !!productInfo.lot_no && !!productInfo.qty && !!productInfo.unit_id) {
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
                    handleEditProduct(null)
                    setShouldOpenModal(false)
                }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t('order.export.productEdit')}
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
                                className="uppercaseInput"
                                label={t('order.export.lot_no')}
                                onChange={handleChange}
                                value={productInfo.lot_no || ''}
                                name='lot_no'
                                variant="outlined"
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
                        <Grid item xs>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="export_type">{t('order.export.export_type')}</InputLabel>
                                <Select
                                    labelId="export_type"
                                    id="export_type-select"
                                    value={productInfo.exp_tp || '1'}
                                    onChange={handleChange}
                                    label={t('order.export.export_type')}
                                    name='exp_tp'
                                >
                                    <MenuItem value="1">{t('order.export.export_type_buy')}</MenuItem>
                                    <MenuItem value="2">{t('order.export.export_type_selloff')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                autoFocus={true}
                                value={productInfo.qty}
                                label={t('order.export.qty')}
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
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.price}
                                label={t('order.export.price')}
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
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.discount_per}
                                label={t('order.export.discount_per')}
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
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.vat_per}
                                label={t('order.export.vat_per')}
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button size='small'
                        onClick={e => {
                            handleEditProduct(null)
                            setProductInfo({ ...productExportModal })
                            setShouldOpenModal(false);
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleEditProduct(productInfo);
                            setProductInfo({ ...productExportModal })
                            setShouldOpenModal(false)
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default EditProductRows;
