import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import NumberFormat from 'react-number-format'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../Unit/Control/Unit.Autocomplete'

const PriceAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [Price, setPrice] = useState({})
    const [productSelect, setProductSelect] = useState('')
    const [unitSelect, setUnitSelect] = useState('')

    useEffect(() => {
        if (shouldOpenModal) {
            setPrice({})
            setProductSelect('')
            setUnitSelect('')
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!Price.product && !!Price.unit && !!Price.importPrice && !!Price.importVAT && !!Price.price && !!Price.wholePrice && !!Price.exportVAT) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newPrice = { ...Price };
        newPrice['product'] = !!obj ? obj?.o_1 : null
        setProductSelect(!!obj ? obj?.o_2 : '')
        setPrice(newPrice)
    }

    const handleSelectUnit = obj => {
        const newPrice = { ...Price };
        newPrice['unit'] = !!obj ? obj?.o_1 : null
        setUnitSelect(!!obj ? obj?.o_2 : '')
        setPrice(newPrice)
    }

    const handleChange = e => {
        const newPrice = { ...Price };
        newPrice[e.target.name] = e.target.value
        setPrice(newPrice)
    }

    const handleImportPriceChange = value => {
        const newPrice = { ...Price };
        newPrice['importPrice'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }
    const handleImportVATChange = value => {
        const newPrice = { ...Price };
        newPrice['importVAT'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }
    const handlePriceChange = value => {
        const newPrice = { ...Price };
        newPrice['price'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }
    const handleWholePriceChange = value => {
        const newPrice = { ...Price };
        newPrice['wholePrice'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }

    const handleExportVATChange = value => {
        const newPrice = { ...Price };
        newPrice['exportVAT'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            onClose={e => {
                handleCloseAddModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('config.price.titleAdd')}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <Product_Autocomplete
                            value={productSelect}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                            onSelect={handleSelectProduct}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <Unit_Autocomplete
                            value={unitSelect}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.configUnit')}
                            onSelect={handleSelectUnit}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={Price.importPrice}
                            label={t('config.price.importPrice')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleImportPriceChange}
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
                            value={Price.importVAT}
                            label={t('config.price.importVAT')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            suffix="%"
                            thousandSeparator={true}
                            onValueChange={handleImportVATChange}
                            inputProps={{
                                min: 0,
                                max: 10
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={Price.price}
                            label={t('config.price.price')}
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
                            value={Price.wholePrice}
                            label={t('config.price.wholePrice')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleWholePriceChange}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={Price.exportVAT}
                            label={t('config.price.exportVAT')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            suffix="%"
                            thousandSeparator={true}
                            onValueChange={handleExportVATChange}
                            inputProps={{
                                min: 0,
                                max: 10
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container>
                    <TextField
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('config.price.note')}
                        onChange={handleChange}
                        value={Price.note || ''}
                        name='note'
                        variant="outlined"
                    />
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseAddModal(false);
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(false, Price);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(true, Price);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('config.save_continue')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default PriceAdd