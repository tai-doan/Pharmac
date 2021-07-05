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

const UnitRateAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [unitRate, setUnitRate] = useState({})
    const [productSelect, setProductSelect] = useState('')
    const [unitSelect, setUnitSelect] = useState('')

    useEffect(() => {
        if (shouldOpenModal) {
            setUnitRate({})
            setProductSelect('')
            setUnitSelect('')
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!unitRate.product && !!unitRate.unit && !!unitRate.rate) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newUnitRate = { ...unitRate };
        newUnitRate['product'] = !!obj ? obj?.o_1 : null
        setUnitRate(newUnitRate)
        setProductSelect(!!obj ? obj?.o_2 : '')
    }

    const handleSelectUnit = obj => {
        const newUnitRate = { ...unitRate };
        newUnitRate['unit'] = !!obj ? obj?.o_1 : null
        setUnitRate(newUnitRate)
        setUnitSelect(!!obj ? obj?.o_2 : '')
    }

    const handleChange = value => {
        const newUnitRate = { ...unitRate };
        newUnitRate['rate'] = Math.round(value.floatValue)
        setUnitRate(newUnitRate)
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
                {t('config.unitRate.titleAdd')}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container className="{}" spacing={2}>
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
                            value={unitRate.rate}
                            label={t('config.unitRate.rate')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleChange}
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
                        handleCreate(false, unitRate);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(true, unitRate);
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

export default UnitRateAdd