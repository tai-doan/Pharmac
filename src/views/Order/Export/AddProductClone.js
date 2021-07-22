import React, { useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Select, FormControl, MenuItem, InputLabel, Button, TextField } from '@material-ui/core'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportModal } from './Modal/Export.modal'
import LotNoByProduct_Autocomplete from '../../../components/LotNoByProduct';

const serviceInfo = {
    GET_PRODUCT_IMPORT_INFO: {
        functionName: 'get_imp_info',
        reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
        biz: 'common',
        object: 'products'
    },
}

const AddProduct = ({ onAddProduct, resetFlag }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportModal })
    const [productImportInfoData, setproductImportInfoData] = useState([])

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)
    const stepFiveRef = useRef(null)
    const stepSixRef = useRef(null)
    const stepSevenRef = useRef(null)
    const stepEightRef = useRef(null)

    useEffect(() => {
        if (resetFlag) {
            setProductInfo({ ...productExportModal })
            setproductImportInfoData({})
            stepTwoRef.current.focus()
        }
    }, [resetFlag])

    useEffect(() => {
        if (productInfo.prod_id !== null) {
            // sendRequest(serviceInfo.GET_PRODUCT_IMPORT_INFO, [productInfo.prod_id], handleResultGetProductImportInfo, true, handleTimeOut)
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
            if (data.rowTotal > 1) {
                const newProductInfo = { ...productInfo };
                newProductInfo['unit_id'] = data.rows[1].o_1
                setProductInfo(newProductInfo)
                setproductImportInfoData(data.rows)
            }
        }
    }

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        newProductInfo['lot_no'] = null
        newProductInfo['quantity_in_stock'] = ''
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
        if (e.target.name === 'imp_tp' && e.target.value !== '1') {
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

    const handleSelectLotNo = object => {
        const newProductInfo = { ...productInfo };
        newProductInfo['quantity_in_stock'] = !!object ? object.o_5 : null
        newProductInfo['lot_no'] = !!object ? object.o_3 : null
        newProductInfo['unit_id'] = !!object ? object.o_7 : null
        setProductInfo(newProductInfo)
    }

    const checkValidate = () => {
        if (!!productInfo.imp_tp && productInfo.imp_tp === '1') {
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
        <Card className='mb-2'>
            <CardHeader
                title={t('order.import.productAdd')}
            />
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item xs={3}>
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
                    <Grid item xs={4}>
                        <Product_Autocomplete
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
                        <LotNoByProduct_Autocomplete
                            disabled={!productInfo.prod_id}
                            productID={productInfo.prod_id}
                            label={t('order.export.lot_no')}
                            onSelect={handleSelectLotNo}
                            inputRef={stepThreeRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepFourRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
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
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs>
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
                            unitID={productInfo.unit_id || null}
                            // value={productInfo.unit_nm || ''}
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
                            disabled={productInfo.exp_tp !== '1'}
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
                            inputRef={stepSixRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepSevenRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat className='inputNumber'
                            style={{ width: '100%' }}
                            required
                            disabled={productInfo.exp_tp !== '1'}
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
                            disabled={productInfo.exp_tp !== '1'}
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
                            onFocus={(event) => event.target.select()}
                            inputRef={stepEightRef}
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
