import React, { useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportDestroyModal } from './Modal/ExportDestroy.modal'
import LotNoByProduct_Autocomplete from '../../../components/LotNoByProduct';

const AddProduct = ({ onAddProduct, resetFlag }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportDestroyModal })
    const [productOpenFocus, setProductOpenFocus] = useState(false)
    const [isInventory, setIsInventory] = useState(true)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)
    const stepFiveRef = useRef(null)
    const stepSixRef = useRef(null)

    useEffect(() => {
        if (resetFlag) {
            setProductInfo({ ...productExportDestroyModal })
            stepOneRef.current.focus()
        }
    }, [resetFlag])

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        newProductInfo['lot_no'] = null
        newProductInfo['quantity_in_stock'] = ''
        if (!!obj) {
            stepThreeRef.current.focus()

            // bắn event lấy thông tin cấu hình bảng giá => nhập fill vào các ô dưới
        }
        setProductOpenFocus(false)
        setProductInfo(newProductInfo)
    }

    const handleSelectUnit = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
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
    }

    const handleChange = e => {
        const newProductInfo = { ...productInfo };
        newProductInfo[e.target.name] = e.target.value
        setProductInfo(newProductInfo)
    }

    const checkValidate = () => {
        if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id && productInfo.price >= 0) {
            return false
        }
        return true
    }

    return (
        <Card className='mb-2'>
            <CardHeader
                title={t('order.import.productAdd')}
                action={
                    <FormControlLabel style={{ margin: 0 }}
                        control={<Checkbox style={{ padding: 0 }} checked={isInventory} onChange={e => setIsInventory(e.target.checked)} name="only_get_inventory_lot_no" />}
                        label={t('only_get_inventory_lot_no')}
                    />
                }
            />
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item xs={3}>
                        <FormControl margin="dense" variant="outlined" className='w-100'>
                            <InputLabel id="reason_tp">{t('order.exportDestroy.reason_tp')}</InputLabel>
                            <Select
                                labelId="reason_tp"
                                id="reason_tp-select"
                                value={productInfo.reason_tp || '1'}
                                onChange={handleChange}
                                onClose={e => {
                                    setTimeout(() => {
                                        setProductOpenFocus(true)
                                        stepOneRef.current.focus()
                                    }, 0);
                                }}
                                label={t('order.exportDestroy.reason_tp')}
                                name='reason_tp'
                                inputRef={stepSixRef}
                            >
                                <MenuItem value="1">{t('order.exportDestroy.cancel_by_out_of_date')}</MenuItem>
                                <MenuItem value="2">{t('order.exportDestroy.cancel_by_lost_goods')}</MenuItem>
                                <MenuItem value="3">{t('order.exportDestroy.cancel_by_inventory_balance')}</MenuItem>
                                <MenuItem value="4">{t('other_reason')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
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
                    <Grid item xs={3}>
                        <LotNoByProduct_Autocomplete
                            isInventory={isInventory}
                            disabled={!productInfo.prod_id}
                            productID={productInfo.prod_id}
                            label={t('order.export.lot_no')}
                            onSelect={handleSelectLotNo}
                            inputRef={stepTwoRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepThreeRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
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
                </Grid>
                <Grid container spacing={1}>
                    <Grid item xs>
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
                            inputRef={stepThreeRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepFourRef.current.focus()
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
                            inputRef={stepFourRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    stepFiveRef.current.focus()
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
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
                            inputRef={stepFiveRef}
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
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
