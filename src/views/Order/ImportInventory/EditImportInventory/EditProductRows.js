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
import SnackBarService from '../../../../utils/service/snackbar_service'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'
import { useHotkeys } from 'react-hotkeys-hook'
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID,
        biz: 'import',
        object: 'imp_inventory_dt'
    },
    GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID: {
        functionName: 'get_all',
        reqFunct: reqFunction.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID,
        biz: 'import',
        object: 'imp_inventory_dt'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
        biz: 'import',
        object: 'imp_inventory_dt'
    },
    UPDATE_PRODUCT_TO_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_UPDATE,
        biz: 'import',
        object: 'imp_inventory_dt'
    },
    DELETE_PRODUCT_TO_INVOICE: {
        functionName: 'delete',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_DELETE,
        biz: 'import',
        object: 'imp_inventory_dt'
    }
}

const EditProductRows = ({ productEditID, invoiceID, onRefresh, setProductEditID }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productImportModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productImportModal }); setProductEditID(-1) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                invoice_id: newData.rows[0].o_2,
                edit_id: newData.rows[0].o_1,
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
            console.log('newData: ', newData)
            setProductInfo(dataConvert)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const handleUpdate = () => {
        if (!productInfo.invoice_id || !productInfo.edit_id || productInfo.qty <= 0 || productInfo.price < 0) return
        setProcess(true)
        const inputParam = [
            productInfo.invoice_id,
            productInfo.edit_id,
            productInfo.qty,
            productInfo.price
        ]
        console.log('invoiceID: ', invoiceID, 'productEditID: ', productEditID)
        sendRequest(serviceInfo.UPDATE_PRODUCT_TO_INVOICE, inputParam, handleResultUpdateProduct, true, handleTimeOut)
    }

    const handleResultUpdateProduct = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            onRefresh()
            setShouldOpenModal(false)
            setProductEditID(-1)
            // productInfoPrev.current = productImportModal
            setProductInfo({ ...productImportModal })
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
        if (productInfo.qty > 0 && !!productInfo.unit_id && productInfo.price > -1) {
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
                    setProductInfo({ ...productImportModal })
                    setShouldOpenModal(false)
                    setProductEditID(-1)
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
                        </Grid>
                        <Grid container spacing={2}>
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleUpdate()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setProductInfo({ ...productImportModal })
                                setShouldOpenModal(false);
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
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default EditProductRows;
