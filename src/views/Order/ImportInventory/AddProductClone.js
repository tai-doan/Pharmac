import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Button, TextField } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productImportModal } from './Modal/ImportInventory.modal'
import NumberFormat from 'react-number-format'
import moment from 'moment'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

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
    const [productOpenFocus, setProductOpenFocus] = useState(true)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)
    const stepFiveRef = useRef(null)
    const stepSixRef = useRef(null)

    useEffect(() => {
        stepOneRef.current.focus()
    }, [])

    useEffect(() => {
        if (resetFlag) {
            setProductInfo({ ...productImportModal })
            setproductImportInfoData({})
            stepOneRef.current.focus()
        }
    }, [resetFlag])

    useEffect(() => {
        if (productInfo.prod_id !== null) {
            sendRequest(serviceInfo.GET_PRODUCT_IMPORT_INFO, [productInfo.prod_id], handleResultGetProductImportInfo, true, handleTimeOut)
            sendRequest(serviceInfo.GET_PRICE_BY_PRODUCT_ID, [productInfo.prod_id], handleResultGetPrice, true, handleTimeOut)
        }
    }, [productInfo.prod_id])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleResultGetProductImportInfo = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
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
            } else {
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
            stepTwoRef.current.focus()

            // bắn event lấy thông tin cấu hình bảng giá => nhập fill vào các ô dưới
        }
        setProductOpenFocus(false)
        setProductInfo(newProductInfo)
    }

    const handleResultGetPrice = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA'];
            if (data.rows.length > 0) {
                let itemMinUnit = data.rows.find(x => x.o_4 === productInfo?.unit_id)
                const newProductInfo = {};
                if (itemMinUnit) {
                    // bảng giá đã config giá nhỏ nhất
                    newProductInfo['price'] = itemMinUnit.o_6
                    setProductInfo(prev => { return { ...prev, ...newProductInfo } })
                } else {
                    // bảng giá chưa config giá nhỏ nhất
                    newProductInfo['unit_id'] = data.rows[0].o_4;
                    newProductInfo['price'] = data.rows[0].o_6
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

    const checkValidate = () => {
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

    return (
        <Card className='mb-2'>
            <CardHeader
                title={t('order.import.productAdd')}
            />
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item xs={4}>
                        <Product_Autocomplete
                            openOnFocus={productOpenFocus}
                            value={productInfo.prod_nm}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                            onSelect={handleSelectProduct}
                            inputRef={stepOneRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepTwoRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
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
                            inputRef={stepTwoRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    let LotNo = productImportInfoData.find(x => x.o_2 === productInfo.lot_no)
                                    if (!!LotNo) {
                                        const newProductInfo = { ...productInfo };
                                        newProductInfo['exp_dt'] = moment(LotNo.o_3, 'YYYYMMDD').toString()
                                        setProductInfo(newProductInfo)
                                    }
                                    stepThreeRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
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
                                inputRef={stepThreeRef}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        stepFourRef.current.focus()
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
                            onFocus={(event) => event.target.select()}
                            inputProps={{
                                min: 0,
                            }}
                            inputRef={stepFourRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepFiveRef.current.focus()
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
                            inputRef={stepFiveRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepSixRef.current.focus()
                                }
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
                            onFocus={(event) => event.target.select()}
                            inputProps={{
                                min: 0,
                            }}
                            inputRef={stepSixRef}
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
