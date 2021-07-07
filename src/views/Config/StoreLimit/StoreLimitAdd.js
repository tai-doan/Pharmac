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

const StoreLimitAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [StoreLimit, setStoreLimit] = useState({})
    const [productSelect, setProductSelect] = useState('')
    const [unitSelect, setUnitSelect] = useState('')

    useEffect(() => {
        if (shouldOpenModal) {
            setStoreLimit({})
            setProductSelect('')
            setUnitSelect('')
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!StoreLimit.product && !!StoreLimit.unit && !!StoreLimit.minQuantity && !!StoreLimit.maxQuantity) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['product'] = !!obj ? obj?.o_1 : null
        setProductSelect(!!obj ? obj?.o_2 : '')
        setStoreLimit(newStoreLimit)
    }

    const handleSelectUnit = obj => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['unit'] = !!obj ? obj?.o_1 : null
        setUnitSelect(!!obj ? obj?.o_2 : '')
        setStoreLimit(newStoreLimit)
    }

    const handleMinQuantityChange = value => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['minQuantity'] = Math.round(value.floatValue)
        setStoreLimit(newStoreLimit)
    }
    const handleMaxQuantityChange = value => {
        const newStoreLimit = { ...StoreLimit };
        newStoreLimit['maxQuantity'] = Math.round(value.floatValue)
        setStoreLimit(newStoreLimit)
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
                {t('config.store_limit.titleAdd')}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container spacing={2}>
                    <Grid item xs>
                        <Product_Autocomplete
                            value={productSelect}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                            onSelect={handleSelectProduct}
                        />
                    </Grid>
                    <Grid item xs>
                        <Unit_Autocomplete
                            value={unitSelect}
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
                            value={StoreLimit.minQuantity}
                            label={t('config.store_limit.minQuantity')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleMinQuantityChange}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={StoreLimit.maxQuantity}
                            label={t('config.store_limit.maxQuantity')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            // suffix="%"
                            thousandSeparator={true}
                            onValueChange={handleMaxQuantityChange}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
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
                        handleCreate(false, StoreLimit);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(true, StoreLimit);
                        setStoreLimit({})
                        setProductSelect('')
                        setUnitSelect('')
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

export default StoreLimitAdd