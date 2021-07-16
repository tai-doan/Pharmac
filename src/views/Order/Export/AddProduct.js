import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportModal } from './Modal/Export.modal'
import NumberFormat from 'react-number-format'
import { Card, CardHeader, CardContent, CardActions, Grid, Select, FormControl, MenuItem, InputLabel, Button, TextField, Dialog } from '@material-ui/core'
import LotNoByProduct_Autocomplete from '../../../components/LotNoByProduct'
import { useHotkeys } from 'react-hotkeys-hook'

const ProductExportAdd = ({ handleAddProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => { handleAddProduct(productInfo); setShouldOpenModal(false); setProductInfo({ ...productExportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleAddProduct(productInfo); setProductInfo({ ...productExportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setProductInfo({ ...productExportModal }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        newProductInfo['lot_no'] = !!obj ? '' : null
        newProductInfo['quantity_in_stock'] = !!obj ? '' : ''
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
        newProductInfo['qty'] = Math.round(value.floatValue)
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['price'] = Math.round(value.floatValue)
        setProductInfo(newProductInfo)
    }

    const handleDiscountChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['discount_per'] = Math.round(value.floatValue) >= 0 && Math.round(value.floatValue) <= 100 ? Math.round(value.floatValue) : 10
        setProductInfo(newProductInfo)
    }

    const handleVATChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['vat_per'] = Math.round(value.floatValue) >= 0 && Math.round(value.floatValue) <= 100 ? Math.round(value.floatValue) : 10
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
        <>
            <Button size="small" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} variant="contained">{t('order.export.productAdd')}</Button>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('order.export.productAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs>
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
                                <LotNoByProduct_Autocomplete
                                    disabled={!productInfo.prod_id}
                                    productID={productInfo.prod_id}
                                    label={t('order.export.lot_no')}
                                    onSelect={handleSelectLotNo}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
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
                                <Unit_Autocomplete
                                    unitID={productInfo.unit_id || null}
                                    value={productInfo.unit_nm || ''}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
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
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>

                            <Grid item xs>
                                <NumberFormat
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
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
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
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
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
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setProductInfo({ ...productExportModal })
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
                                setProductInfo({ ...productExportModal })
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
                                setProductInfo({ ...productExportModal })
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

export default ProductExportAdd;
