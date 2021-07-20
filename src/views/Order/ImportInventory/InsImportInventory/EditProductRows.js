import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Dialog, DialogTitle, DialogActions, DialogContent, TextField, Button, InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
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
import { useHotkeys } from 'react-hotkeys-hook'

const EditProductRows = ({ productEditID, productData, handleEditProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productData })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productData }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (productEditID !== -1 && !!productData) {
            setShouldOpenModal(true)
            let productDataDefault = { ...productData }
            productDataDefault.exp_dt = moment(productDataDefault.exp_dt, 'YYYYMMDD').toString();
            setProductInfo({ ...productDataDefault })
        }
    }, [productData, productEditID])

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
        newProductInfo['discount_per'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handleVATChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['vat_per'] = Number(value.value)
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
                    {t('order.importInventory.productEdit')}
                </DialogTitle>
                <DialogContent className="pt-0">
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="import_type">{t('order.importInventory.import_type')}</InputLabel>
                                <Select
                                    labelId="import_type"
                                    id="import_type-select"
                                    value={productInfo.imp_tp || '1'}
                                    onChange={handleChange}
                                    label={t('order.importInventory.import_type')}
                                    name='imp_tp'
                                >
                                    <MenuItem value="1">{t('order.importInventory.import_type_buy')}</MenuItem>
                                    <MenuItem value="2">{t('order.importInventory.import_type_selloff')}</MenuItem>
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
                                multiline
                                rows={1}
                                autoComplete="off"
                                required
                                className="uppercaseInput"
                                label={t('order.importInventory.lot_no')}
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
                                    label={t('order.importInventory.exp_dt')}
                                    value={productInfo.exp_dt}
                                    onChange={handleExpDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.qty}
                                label={t('order.importInventory.qty')}
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.price}
                                label={t('order.importInventory.price')}
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.discount_per}
                                label={t('order.importInventory.discount_per')}
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={productInfo.vat_per}
                                label={t('order.importInventory.vat_per')}
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
                </DialogContent>
                <DialogActions>
                    <Button size='small'
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
                    <Button size='small'
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
                </DialogActions>
            </Dialog>
        </>
    )
}

export default EditProductRows;
