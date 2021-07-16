import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, IconButton, Chip, Select, FormControl, MenuItem, InputLabel, TextField, Grid, Button, Dialog
} from '@material-ui/core'
import { defaultModalAdd } from './Modal/Supplier.modal';
import Dictionary from '../../../components/Dictionary'
import { useHotkeys } from 'react-hotkeys-hook'

const SupplierAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [Supplier, setSupplier] = useState({ ...defaultModalAdd })
    useHotkeys('f3', () => handleCreate(false, Supplier), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(true, Supplier), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => handleCloseAddModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal) {
            setSupplier({ ...defaultModalAdd })
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!Supplier.vender_nm_v) {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newSupplier = { ...Supplier };
        newSupplier[e.target.name] = e.target.value
        setSupplier(newSupplier)
    }

    const handleSelectBank = obj => {
        const newSupplier = { ...Supplier };
        newSupplier['bank_cd'] = !!obj ? obj?.o_1 : null
        setSupplier(newSupplier)
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
                <CardHeader title={t('partner.supplier.titleAdd')} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                required={true}
                                className="uppercaseInput"
                                autoComplete="off"
                                label={t('partner.supplier.vender_nm_v')}
                                onChange={handleChange}
                                value={Supplier.vender_nm_v || ''}
                                name='vender_nm_v'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                className="uppercaseInput"
                                autoComplete="off"
                                label={t('partner.supplier.vender_nm_e')}
                                onChange={handleChange}
                                value={Supplier.vender_nm_e || ''}
                                name='vender_nm_e'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                className="uppercaseInput"
                                autoComplete="off"
                                label={t('partner.supplier.vender_nm_short')}
                                onChange={handleChange}
                                value={Supplier.vender_nm_short || ''}
                                name='vender_nm_short'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.address')}
                                onChange={handleChange}
                                value={Supplier.address || ''}
                                name='address'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.phone')}
                                onChange={handleChange}
                                value={Supplier.phone || ''}
                                name='phone'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.fax')}
                                onChange={handleChange}
                                value={Supplier.fax || ''}
                                name='fax'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.email')}
                                onChange={handleChange}
                                value={Supplier.email || ''}
                                name='email'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.website')}
                                onChange={handleChange}
                                value={Supplier.website || ''}
                                name='website'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.tax_cd')}
                                onChange={handleChange}
                                value={Supplier.tax_cd || ''}
                                name='tax_cd'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.bank_acnt_no')}
                                onChange={handleChange}
                                value={Supplier.bank_acnt_no || ''}
                                name='bank_acnt_no'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.bank_acnt_nm')}
                                onChange={handleChange}
                                value={Supplier.bank_acnt_nm || ''}
                                name='bank_acnt_nm'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Dictionary
                                diectionName='bank_cd'
                                onSelect={handleSelectBank}
                                label={t('partner.supplier.bank_cd')}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                            />
                            {/* <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('partner.supplier.bank_cd')}
                                onChange={handleChange}
                                value={Supplier.bank_cd || ''}
                                name='bank_cd'
                                variant="outlined"
                            /> */}
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="default_yn">{t('partner.supplier.default_yn')}</InputLabel>
                                <Select
                                    labelId="default_yn"
                                    id="default_yn-select"
                                    value={Supplier.default_yn || 'Y'}
                                    onChange={handleChange}
                                    label={t('partner.supplier.default_yn')}
                                    name='default_yn'
                                >
                                    <MenuItem value="Y">{t('yes')}</MenuItem>
                                    <MenuItem value="N">{t('no')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Supplier.vender_tp === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_nm')}
                                onChange={handleChange}
                                value={Supplier.agent_nm || ''}
                                name='agent_nm'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Supplier.vender_tp === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_fun')}
                                onChange={handleChange}
                                value={Supplier.agent_fun || ''}
                                name='agent_fun'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Supplier.vender_tp === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_phone')}
                                onChange={handleChange}
                                value={Supplier.agent_phone || ''}
                                name='agent_phone'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Supplier.vender_tp === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_email')}
                                onChange={handleChange}
                                value={Supplier.agent_email || ''}
                                name='agent_email'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                disabled={Supplier.agent_nm === '1'}
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={2}
                                autoComplete="off"
                                label={t('partner.supplier.agent_address')}
                                onChange={handleChange}
                                value={Supplier.agent_address || ''}
                                name='agent_address'
                                variant="outlined"
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
                            handleCreate(false, Supplier);
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleCreate(true, Supplier);
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

export default SupplierAdd