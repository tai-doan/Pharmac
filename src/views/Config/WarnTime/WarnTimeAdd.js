import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import NumberFormat from 'react-number-format'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Dictionary from '../../../components/Dictionary'
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

const WarnTimeAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [warnTime, setWarnTime] = useState({})
    const [productSelect, setProductSelect] = useState('')

    useHotkeys('f3', () => handleCreate(false, warnTime), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(true, warnTime), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => handleCloseAddModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal) {
            setWarnTime({})
            setProductSelect('')
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!warnTime.product && !!warnTime.warn_amt && !!warnTime.warn_time_tp) {
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

    const handleChangeTimeTp = obj => {
        const newWarnTime = { ...warnTime };
        newWarnTime['warn_time_tp'] = !!obj ? obj?.o_1 : null
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
            <Card>
                <CardHeader title={t('config.warnTime.titleAdd')} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <Product_Autocomplete
                                value={productSelect || ''}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                                onSelect={handleSelectProduct}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={warnTime.warn_amt || ''}
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
                        <Grid item xs>
                            <Dictionary
                                value={warnTime.warn_time_tp || ''}
                                diectionName='warn_time_tp'
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('config.warnTime.warn_time_tp')}
                                onSelect={handleChangeTimeTp}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            handleCloseAddModal(false);
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleCreate(false, warnTime);
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            setWarnTime({})
                            setProductSelect('')
                            handleCreate(true, warnTime);
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('save_continue')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default WarnTimeAdd