import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete'
import { productImportModal } from '../Modal/ImportInventory.modal'
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

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID,
        biz: 'import',
        object: 'imp_inventory_dt'
    }
}

const EditProductRows = ({ productEditID, handleEditProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productImportModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productImportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                    case reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID:
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
                prod_id: newData.rows[0].o_3,
                prod_nm: newData.rows[0].o_4,
                lot_no: newData.rows[0].o_5,
                made_dt: newData.rows[0].o_6,
                exp_dt: moment(newData.rows[0].o_7, 'YYYYMMDD').toString(),
                qty: newData.rows[0].o_8,
                unit_id: newData.rows[0].o_9,
                unit_nm: newData.rows[0].o_10,
                price: newData.rows[0].o_11
            }
            setProductInfo(dataConvert)
        }
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
        if (!!productInfo.prod_id && !!productInfo.lot_no && !!productInfo.qty && !!productInfo.unit_id && !!productInfo.price) {
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
                <Card>
                    <CardHeader title={t('order.import.productEdit')} />
                    <CardContent>
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
                                <Unit_Autocomplete
                                    disabled={true}
                                    value={productInfo.unit_nm || ''}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
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
                                    label={t('order.import.lot_no')}
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
                                    autoFocus={true}
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
                                />
                            </Grid>
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
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={e => {
                                handleEditProduct(null)
                                setProductInfo({ ...productImportModal })
                                setShouldOpenModal(false);
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleEditProduct(productInfo);
                                setProductInfo({ ...productImportModal })
                                setShouldOpenModal(false)
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('btn.save')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default EditProductRows;
