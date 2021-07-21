import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Select, FormControl, MenuItem, InputLabel, Button, TextField } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productImportModal } from './Modal/Import.modal'
import NumberFormat from 'react-number-format'

const AddProduct = ({ onAddProduct, resetFlag }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productImportModal })

    useEffect(() => {
        if(resetFlag){
            setProductInfo({...productImportModal})
        }
    }, [resetFlag])

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
        if (!!productInfo.imp_tp && productInfo.imp_tp === '1') {
            if (!!productInfo.prod_id && !!productInfo.lot_no && !!productInfo.qty && !!productInfo.unit_id && productInfo.price > -1 && productInfo.discount_per > -1 && productInfo.discount_per < 100 && productInfo.vat_per > -1) {
                return false
            } else
                return true
        } else {
            if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id) {
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
                            value={productInfo.prod_nm}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                            onSelect={handleSelectProduct}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            required
                            className="uppercaseInput"
                            autoComplete="off"
                            label={t('order.import.lot_no')}
                            onChange={handleChange}
                            value={productInfo.lot_no || ''}
                            name='lot_no'
                            variant="outlined"
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (checkValidate()) return
                                    onAddProduct(productInfo);
                                    // setProductInfo({ ...productImportModal })
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
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
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        if (checkValidate()) return
                                        onAddProduct(productInfo);
                                        // setProductInfo({ ...productImportModal })
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
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (checkValidate()) return
                                    onAddProduct(productInfo);
                                    // setProductInfo({ ...productImportModal })
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <Unit_Autocomplete
                            value={productInfo.unit_nm || ''}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.configUnit')}
                            onSelect={handleSelectUnit}
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
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (checkValidate()) return
                                    onAddProduct(productInfo);
                                    // setProductInfo({ ...productImportModal })
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
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (checkValidate()) return
                                    onAddProduct(productInfo);
                                    // setProductInfo({ ...productImportModal })
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
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    if (checkValidate()) return
                                    onAddProduct(productInfo);
                                    // setProductInfo({ ...productImportModal })
                                }
                            }}
                        />
                    </Grid>
                    <Grid item className='d-flex align-items-center'>
                        <Button
                            onClick={() => {
                                onAddProduct(productInfo);
                                // setProductInfo({ ...productImportModal })
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
