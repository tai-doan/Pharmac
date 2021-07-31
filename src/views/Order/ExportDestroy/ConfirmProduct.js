import React, { useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Button, TextField, Dialog, CardActions, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportDestroyModal } from './Modal/ExportDestroy.modal'
import LotNoByProduct_Autocomplete from '../../../components/LotNoByProduct';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

const serviceInfo = {
    GET_PRICE_BY_PRODUCT_ID: {
        functionName: 'get_by_prodid',
        reqFunct: reqFunction.EXPORT_BY_ID,
        biz: 'common',
        object: 'setup_price'
    }
}

const ConfirmProduct = ({ productData, isInventory, shouldOpenModal, handleCloseModal, onAddProduct, invoiceType = true }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportDestroyModal })
    const [priceList, setPriceList] = useState([])
    const [selectLotNoFlag, setSelectLotNoFlag] = useState(false)

    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)

    useEffect(() => {
        setProductInfo(productData)
        if (step2Ref?.current) step2Ref.current.focus()
    }, [productData])

    useEffect(() => {
        if (selectLotNoFlag && productInfo.prod_id) {
            setPriceList([])
            sendRequest(serviceInfo.GET_PRICE_BY_PRODUCT_ID, [productInfo.prod_id], handleResultGetPrice, true, handleTimeOut)
        }
    }, [selectLotNoFlag])

    const handleResultGetPrice = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA']
            setPriceList(data.rows)
            if (data.rows.length > 0) {
                let itemMinUnit = data.rows.find(x => x.o_4 === productInfo?.unit_id)
                const newProductInfo = { ...productInfo };
                if (itemMinUnit) {
                    // bảng giá đã config giá nhỏ nhất
                    newProductInfo['price'] = itemMinUnit.o_9// invoiceType ? itemMinUnit.o_8 : itemMinUnit.o_9
                    newProductInfo['discount_per'] = 0
                    newProductInfo['vat_per'] = itemMinUnit.o_10
                    setProductInfo(newProductInfo)
                } else {
                    // bảng giá chưa config giá nhỏ nhất
                    newProductInfo['unit_id'] = data.rows[0].o_4;
                    newProductInfo['price'] = data.rows[0].o_9// invoiceType ? data.rows[0].o_8 : data.rows[0].o_9
                    newProductInfo['discount_per'] = 0
                    newProductInfo['vat_per'] = data.rows[0].o_10
                    setProductInfo(newProductInfo)
                }
            } else {
                const newProductInfo = { ...productInfo };
                newProductInfo['price'] = 0
                newProductInfo['discount_per'] = 0
                newProductInfo['vat_per'] = 0
                setProductInfo(newProductInfo)
            }
            if (step2Ref?.current) step2Ref.current.focus()
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleSelectUnit = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
        const priceData = priceList.find(x => x.o_4 === obj.o_1)
        if (priceData) {
            newProductInfo['price'] = priceData.o_9
            newProductInfo['discount_per'] = 0
            newProductInfo['vat_per'] = priceData.o_10
        } else {
            newProductInfo['price'] = 0
            newProductInfo['discount_per'] = 0
            newProductInfo['vat_per'] = 0
        }
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

    const handleSelectLotNo = object => {
        const newProductInfo = { ...productInfo };
        newProductInfo['quantity_in_stock'] = !!object ? object.o_5 : null
        newProductInfo['lot_no'] = !!object ? object.o_3 : null
        newProductInfo['unit_id'] = !!object ? object.o_7 : null
        newProductInfo['exp_dt'] = !!object ? object.o_4 : null
        setProductInfo(newProductInfo)
        setSelectLotNoFlag(true)
        setTimeout(() => {
            setSelectLotNoFlag(false)
        }, 100);
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
                maxWidth="sm"
                open={shouldOpenModal}
                onClose={e => {
                    handleCloseModal()
                }}
            >
                <Card>
                    <CardHeader title={t('order.exportDestroy.productAdd')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="reason_tp">{t('order.exportDestroy.reason_tp')}</InputLabel>
                                    <Select
                                        labelId="reason_tp"
                                        id="reason_tp-select"
                                        value={productInfo.reason_tp || '1'}
                                        onChange={handleChange}
                                        onClose={e => {
                                            setTimeout(() => {
                                                step1Ref.current.focus()
                                            }, 0);
                                        }}
                                        label={t('order.exportDestroy.reason_tp')}
                                        name='reason_tp'
                                        inputRef={step5Ref}
                                    >
                                        <MenuItem value="1">{t('order.exportDestroy.cancel_by_out_of_date')}</MenuItem>
                                        <MenuItem value="2">{t('order.exportDestroy.cancel_by_lost_goods')}</MenuItem>
                                        <MenuItem value="3">{t('order.exportDestroy.cancel_by_inventory_balance')}</MenuItem>
                                        <MenuItem value="4">{t('other_reason')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <Product_Autocomplete
                                    productID={productInfo.prod_id || null}
                                    disabled={true}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <LotNoByProduct_Autocomplete
                                    isInventory={isInventory}
                                    disabled={!productInfo.prod_id}
                                    productID={productInfo.prod_id}
                                    label={t('order.export.lot_no')}
                                    onSelect={handleSelectLotNo}
                                    inputRef={step1Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step2Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={4}>
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
                                        label={t('order.export.exp_dt')}
                                        value={productInfo.exp_dt ? moment(productInfo.exp_dt, 'YYYYMMDD').toString() : null}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={9}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.store_current')}
                                    value={productInfo.quantity_in_stock || ''}
                                    name='quantity_in_stock'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
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
                                    onFocus={(event) => event.target.select()}
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Unit_Autocomplete
                                    unitID={productInfo.unit_id || null}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                    inputRef={step3Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step4Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <NumberFormat className='inputNumber'
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
                                    onFocus={(event) => event.target.select()}
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                            onAddProduct(productInfo)
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setProductInfo({ ...productExportDestroyModal })
                                handleCloseModal();
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                onAddProduct(productInfo);
                                setProductInfo({ ...productExportDestroyModal })
                                handleCloseModal()
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

export default ConfirmProduct;
