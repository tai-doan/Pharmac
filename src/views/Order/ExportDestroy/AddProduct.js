import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportDestroyModal } from './Modal/ExportDestroy.modal'
import NumberFormat from 'react-number-format'
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'

const ProductExportDestroyAdd = ({ handleAddProduct }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportDestroyModal })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)

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

    const checkValidate = () => {
        if (!!productInfo.prod_id && !!productInfo.lot_no && !!productInfo.qty && !!productInfo.unit_id && !!productInfo.price) {
            return false
        }
        return true
    }

    return (
        <>
            <Button size="small" style={{ backgroundColor: 'green', color: '#fff' }} onClick={() => setShouldOpenModal(true)} variant="contained">{t('order.exportDestroy.productAdd')}</Button>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('order.exportDestroy.productAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
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
                                    label={t('order.exportDestroy.lot_no')}
                                    onChange={handleChange}
                                    value={productInfo.lot_no || ''}
                                    name='lot_no'
                                    variant="outlined"
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
                                    value={productInfo.qty}
                                    label={t('order.exportDestroy.qty')}
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
                                <NumberFormat
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.price}
                                    label={t('order.exportDestroy.price')}
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
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="reason_tp">{t('order.exportDestroy.reason_tp')}</InputLabel>
                                    <Select
                                        labelId="reason_tp"
                                        id="reason_tp-select"
                                        value={productInfo.reason_tp || '1'}
                                        onChange={handleChange}
                                        label={t('order.exportDestroy.reason_tp')}
                                        name='reason_tp'
                                    >
                                        <MenuItem value="1">{t('order.exportDestroy.cancel_by_out_of_date')}</MenuItem>
                                        <MenuItem value="2">{t('order.exportDestroy.cancel_by_lost_goods')}</MenuItem>
                                        <MenuItem value="3">{t('order.exportDestroy.cancel_by_inventory_balance')}</MenuItem>
                                        <MenuItem value="4">{t('other_reason')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={e => {
                                setProductInfo({ ...productExportDestroyModal })
                                setShouldOpenModal(false);
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleAddProduct(productInfo);
                                setProductInfo({ ...productExportDestroyModal })
                                setShouldOpenModal(false)
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('btn.save')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleAddProduct(productInfo);
                                setProductInfo({ ...productExportDestroyModal })
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

export default ProductExportDestroyAdd;
