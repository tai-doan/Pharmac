import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, CardActions, Grid, Select, FormControl, MenuItem, InputLabel, Button, TextField, Dialog } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productImportModal } from './Modal/Import.modal'
import NumberFormat from 'react-number-format'
import { useHotkeys } from 'react-hotkeys-hook'

const ProductImportAdd = ({ handleAddProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productImportModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => { handleAddProduct(productInfo); setShouldOpenModal(false); setProductInfo({ ...productImportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleAddProduct(productInfo); setProductInfo({ ...productImportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productImportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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

    const handleExpDateChange = date => {
        const newProductInfo = { ...productInfo };
        newProductInfo['exp_dt'] = date;
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
        <>
            <Button size="small" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} variant="contained">{t('order.import.productAdd')}</Button>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('order.import.productAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs>
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
                            <Grid item xs>
                                <Product_Autocomplete
                                    value={productInfo.prod_nm}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                />
                            </Grid>
                            <Grid item xs>
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
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs>
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
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
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
                        </Grid>
                        <Grid container spacing={2}>
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
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setProductInfo({ ...productImportModal })
                                setShouldOpenModal(false);
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleAddProduct(productInfo);
                                setProductInfo({ ...productImportModal })
                                setShouldOpenModal(false)
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('btn.save')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleAddProduct(productInfo);
                                setProductInfo({ ...productImportModal })
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default ProductImportAdd;
