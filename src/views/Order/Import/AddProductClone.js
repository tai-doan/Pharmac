import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment';
import NumberFormat from 'react-number-format'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Select, FormControl, MenuItem, InputLabel, Button, TextField } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productImportModal } from './Modal/Import.modal'

const serviceInfo = {
    GET_PRODUCT_IMPORT_INFO: {
        functionName: 'get_imp_info',
        reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
        biz: 'common',
        object: 'products'
    },
    GET_PRICE_BY_PRODUCT_ID: {
        functionName: 'get_by_prodid',
        reqFunct: reqFunction.EXPORT_BY_ID,
        biz: 'common',
        object: 'setup_price'
    }
}

const AddProduct = ({ onAddProduct, resetFlag }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productImportModal })
    const [productImportInfoData, setproductImportInfoData] = useState([])
    const [requireExpDate, setRequireExpDate] = useState(false)
    const [productOpenFocus, setProductOpenFocus] = useState(false)
    const [priceList, setPriceList] = useState([])

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)
    const stepFiveRef = useRef(null)
    const stepSixRef = useRef(null)
    const stepSevenRef = useRef(null)
    const stepEightRef = useRef(null)
    const stepNineRef = useRef(null)

    useEffect(() => {
        if (resetFlag) {
            setProductInfo({ ...productImportModal })
            setproductImportInfoData({})
            stepTwoRef.current.focus()
        }
    }, [resetFlag])

    useEffect(() => {
        if (productInfo.prod_id !== null) {
            setPriceList([])
            sendRequest(serviceInfo.GET_PRODUCT_IMPORT_INFO, [productInfo.prod_id], handleResultGetProductImportInfo, true, handleTimeOut)
            sendRequest(serviceInfo.GET_PRICE_BY_PRODUCT_ID, [productInfo.prod_id], handleResultGetPrice, true, handleTimeOut)
        }
    }, [productInfo.prod_id])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleResultGetProductImportInfo = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA']
            const newProductInfo = {};
            setRequireExpDate(glb_sv.defaultProductGroupId.includes(data.rows[0]['o_4']))
            if (data.rowTotal > 1) {
                newProductInfo['unit_id'] = data.rows[1].o_1
                setProductInfo(prev => { return { ...prev, ...newProductInfo } })
                setproductImportInfoData(data.rows)
            }
            else {
                newProductInfo['unit_id'] = 0
                setProductInfo(prev => { return { ...prev, ...newProductInfo } })
            }
        }
    }

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        if (!!obj) {
            stepThreeRef.current.focus()

            // bắn event lấy thông tin cấu hình bảng giá => nhập fill vào các ô dưới
        }
        setProductOpenFocus(false)
        setProductInfo(newProductInfo)
    }

    const handleResultGetPrice = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA'];
            setPriceList(data.rows)
            if (data.rows.length > 0) {
                let itemMinUnit = data.rows.find(x => x.o_4 === productInfo?.unit_id)
                const newProductInfo = {};
                if (itemMinUnit) {
                    // bảng giá đã config giá nhỏ nhất
                    if (productInfo.imp_tp === '1') {
                        newProductInfo['price'] = itemMinUnit.o_6
                        newProductInfo['vat_per'] = itemMinUnit.o_7
                        newProductInfo['discount_per'] = 0
                        setProductInfo(prev => { return { ...prev, ...newProductInfo } })
                    }
                } else {
                    // bảng giá chưa config giá nhỏ nhất
                    if (productInfo.imp_tp === '1') {
                        newProductInfo['unit_id'] = data.rows[0].o_4;
                        newProductInfo['price'] = data.rows[0].o_6
                        newProductInfo['vat_per'] = data.rows[0].o_7
                        newProductInfo['discount_per'] = 0
                        setProductInfo(prev => { return { ...prev, ...newProductInfo } })
                    }
                }
            } else {
                const newProductInfo = { ...productInfo };
                newProductInfo['price'] = 0
                newProductInfo['discount_per'] = 0
                newProductInfo['vat_per'] = 0
                setProductInfo(newProductInfo)
            }
        }
    }

    const handleSelectUnit = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
        const priceData = priceList.find(x => x.o_4 === obj.o_1)
        if (priceData) {
            newProductInfo['price'] = priceData.o_6
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
        // setProductInfo(newProductInfo)
        if (e.target.name === 'imp_tp' && e.target.value !== '1') {
            newProductInfo['price'] = 0;
            newProductInfo['discount_per'] = 0
            newProductInfo['vat_per'] = 0
            setProductInfo(newProductInfo)
        } else {
            setProductInfo(newProductInfo)
        }
    }

    const handleExpDateChange = date => {
        const newProductInfo = { ...productInfo };
        newProductInfo['exp_dt'] = date;
        setProductInfo(newProductInfo)
    }

    const handleQuantityChange = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['qty'] = Number(obj.value) >= 0 ? Math.round(obj.value) : 0
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['price'] = Number(obj.value) >= 0 ? Math.round(obj.value) : 0
        setProductInfo(newProductInfo)
    }

    const handleDiscountChange = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['discount_per'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setProductInfo(newProductInfo)
    }

    const handleVATChange = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['vat_per'] = Number(obj.value) >= 0 && Number(obj.value) <= 100 ? Math.round(obj.value) : 10
        setProductInfo(newProductInfo)
    }

    const checkValidate = () => {
        if (productInfo.imp_tp === '1') {
            if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id && productInfo.price > -1 && productInfo.discount_per > -1 && productInfo.discount_per < 100 && productInfo.vat_per > -1 && productInfo.vat_per < 100) {
                if (requireExpDate) {
                    if (!!productInfo.exp_dt) {
                        return false
                    } else {
                        return true
                    }
                } else
                    return false
            } else
                return true
        } else {
            if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id) {
                if (requireExpDate) {
                    if (!!productInfo.exp_dt) {
                        return false
                    } else {
                        return true
                    }
                } else
                    return false
            }
            return true
        }
    }

    return (
        <Card className='mb-2'>
            <CardHeader
                title={t('order.import.productAdd')}
            />
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item xs={3}>
                        <FormControl margin="dense" variant="outlined" className='w-100'>
                            <InputLabel id="import_type">{t('order.import.import_type')}</InputLabel>
                            <Select
                                labelId="import_type"
                                id="import_type-select"
                                value={productInfo.imp_tp || '1'}
                                onChange={handleChange}
                                onClose={() => {
                                    setTimeout(() => {
                                        setProductOpenFocus(true)
                                        stepTwoRef.current.focus()
                                    }, 0);
                                }}
                                label={t('order.import.import_type')}
                                name='imp_tp'
                            >
                                <MenuItem value="1">{t('order.import.import_type_buy')}</MenuItem>
                                <MenuItem value="2">{t('order.import.import_type_selloff')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <Product_Autocomplete
                            openOnFocus={productOpenFocus}
                            value={productInfo.prod_nm}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                            onSelect={handleSelectProduct}
                            inputRef={stepTwoRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepThreeRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            required
                            autoComplete="off"
                            label={t('order.import.lot_no')}
                            onChange={handleChange}
                            value={productInfo.lot_no || ''}
                            name='lot_no'
                            variant="outlined"
                            inputRef={stepThreeRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    let LotNo = productImportInfoData.find(x => x.o_2 === productInfo.lot_no)
                                    if (!!LotNo) {
                                        const newProductInfo = { ...productInfo };
                                        newProductInfo['exp_dt'] = moment(LotNo.o_3, 'YYYYMMDD').toString()
                                        setProductInfo(newProductInfo)
                                    }
                                    stepFourRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                required={requireExpDate}
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
                                inputRef={stepFourRef}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        stepFiveRef.current.focus()
                                    }
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
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
                            onFocus={(event) => event.target.select()}
                            inputRef={stepFiveRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepSixRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <Unit_Autocomplete
                            unitID={productInfo.unit_id || 0}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.configUnit')}
                            onSelect={handleSelectUnit}
                            inputRef={stepSixRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (productInfo.imp_tp !== '1') {
                                        if (checkValidate()) return
                                        onAddProduct(productInfo)
                                    } else {
                                        stepSevenRef.current.focus()
                                    }
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat className='inputNumber'
                            style={{ width: '100%' }}
                            required
                            disabled={productInfo.imp_tp !== '1'}
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
                            onFocus={(event) => event.target.select()}
                            inputRef={stepSevenRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepEightRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat className='inputNumber'
                            style={{ width: '100%' }}
                            required
                            disabled={productInfo.imp_tp !== '1'}
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
                            onFocus={(event) => event.target.select()}
                            inputRef={stepEightRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepNineRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat className='inputNumber'
                            style={{ width: '100%' }}
                            required
                            disabled={productInfo.imp_tp !== '1'}
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
                            onFocus={(event) => event.target.select()}
                            inputRef={stepNineRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (checkValidate()) return
                                    onAddProduct(productInfo);
                                }
                            }}
                        />
                    </Grid>
                    <Grid item className='d-flex align-items-center'>
                        <Button
                            onClick={() => {
                                onAddProduct(productInfo);
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('btn.save')}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card >
    )
}

export default AddProduct;
