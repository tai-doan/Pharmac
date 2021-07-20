import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete'
import { productExportDestroyModal } from '../Modal/ExportDestroy.modal'
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
        reqFunct: reqFunction.PRODUCT_EXPORT_DESTROY_INVOICE_BY_ID,
        biz: 'export',
        object: 'exp_destroy_dt'
    }
}

const EditProductRows = ({ productEditID, handleEditProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportDestroyModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productExportDestroyModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                    case reqFunction.PRODUCT_EXPORT_DESTROY_INVOICE_BY_ID:
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
            console.log('data xuất hủy: ', newData)
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
        }
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
        if (!!productInfo.qty && !!productInfo.price && !!productInfo.reason_tp) {
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
                onClose={e => {
                    handleEditProduct(null)
                    setShouldOpenModal(false)
                }}
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
                            <TextField
                                disabled={true}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                required
                                className="uppercaseInput"
                                label={t('order.exportDestroy.lot_no')}
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
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <NumberFormat className='inputNumber' 
                                style={{ width: '100%' }}
                                required
                                autoFocus={true}
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
                            handleEditProduct(null)
                            setProductInfo({ ...productExportDestroyModal })
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
                            setProductInfo({ ...productExportDestroyModal })
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
