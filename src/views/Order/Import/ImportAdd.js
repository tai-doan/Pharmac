import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import Supplier_Autocomplete from '../../Partner/Supplier/Control/Supplier.Autocomplete'

const ImportAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [Import, setImport] = useState({})
    const [supplierSelect, setSupplierSelect] = useState('')

    useEffect(() => {
        if (shouldOpenModal) {
            setImport({})
            setSupplierSelect('')
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!Import.vender_id && !!Import.order_dt) {
            return false
        }
        return true
    }

    const handleSelectSupplier = obj => {
        const newImport = { ...Import };
        newImport['supplier'] = !!obj ? obj?.o_1 : null
        setSupplierSelect(!!obj ? obj?.o_2 : '')
        setImport(newImport)
    }

    const handleDateChange = date => {
        const newImport = { ...Import };
        newImport['order_dt'] = date;
        setImport(newImport)
    }

    const handleChange = e => {
        const newImport = { ...Import };
        newImport[e.target.name] = e.target.value
        setImport(newImport)
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
                {t('order.import.titleAdd')}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.invoice_no')}
                            onChange={handleChange}
                            value={Import.invoice_no || ''}
                            name='invoice_no'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <Supplier_Autocomplete
                            value={supplierSelect}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.supplier')}
                            onSelect={handleSelectSupplier}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                margin="dense"
                                variant="inline"
                                format="dd/MM/yyyy"
                                id="order_dt-picker-inline"
                                label={t('order.import.order_dt')}
                                value={Import.order_dt || new Date()}
                                onChange={handleDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.person_s')}
                            onChange={handleChange}
                            value={Import.person_s || ''}
                            name='person_s'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.person_r')}
                            onChange={handleChange}
                            value={Import.person_r || ''}
                            name='person_r'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('order.import.note')}
                            onChange={handleChange}
                            value={Import.note || ''}
                            name='note'
                            variant="outlined"
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
                        handleCreate(false, Import);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(true, Import);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('order.save_continue')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ImportAdd