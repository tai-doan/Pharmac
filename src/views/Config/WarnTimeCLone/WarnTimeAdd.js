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

const WarnTimeAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [warnTime, setWarnTime] = useState({})
    const [productSelect, setProductSelect] = useState('')

    useEffect(() => {
        if (shouldOpenModal) {
            setWarnTime({})
            setProductSelect('')
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!warnTime.product && !!warnTime.unit && !!warnTime.rate) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newWarnTime = { ...warnTime };
        newWarnTime['product'] = !!obj ? obj?.o_1 : null
        setWarnTime(newWarnTime)
        setProductSelect(!!obj ? obj?.o_2 : '')
    }

    const handleChangeAmt = value => {
        const newWarnTime = { ...warnTime };
        newWarnTime['warn_amt'] = Math.round(value.floatValue)
        setWarnTime(newWarnTime)
    }

    const handleChangeTimeTp = value => {
        const newWarnTime = { ...warnTime };
        newWarnTime['warn_time_tp'] = Math.round(value.floatValue)
        setWarnTime(newWarnTime)
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
                {t('config.warnTime.titleAdd')}
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
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={warnTime.warn_amt}
                            label={t('config.warnTime.warn_amt')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleChangeAmt}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={warnTime.warn_time_tp}
                            label={t('config.warnTime.warn_time_tp')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleChangeTimeTp}
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
                        handleCreate(false, warnTime);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(true, warnTime);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('save_continue')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default WarnTimeAdd