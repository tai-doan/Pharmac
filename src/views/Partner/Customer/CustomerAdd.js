import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import { Grid } from '@material-ui/core'
import { defaultModalAdd } from './Modal/Customer.modal';

const CustomerAdd = ({ id, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
    const { t } = useTranslation()

    const [Customer, setCustomer] = useState({
        cust_nm_v: '',
        cust_nm_e: '',
        cust_nm_short: '',
        cust_tp: '1',
        address: '',
        phone: '',
        fax: '',
        email: '',
        website: '',
        tax_cd: '',
        bank_acnt_no: '',
        bank_acnt_nm: '',
        bank_nm: '',
        agent_nm: '',
        agent_fun: '',
        agent_address: '',
        agent_phone: '',
        agent_email: '',
        default_yn: 'Y'
    })

    useEffect(() => {
        if (shouldOpenModal) {
            setCustomer({...defaultModalAdd})
        }
    }, [shouldOpenModal])

    const checkValidate = () => {
        if (!!Customer.cust_nm_v) {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newCustomer = { ...Customer };
        newCustomer[e.target.name] = e.target.value
        setCustomer(newCustomer)
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
                {t('partner.customer.titleAdd')}
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
                            label={t('partner.customer.cust_nm_v')}
                            onChange={handleChange}
                            value={Customer.cust_nm_v || ''}
                            name='cust_nm_v'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.cust_nm_e')}
                            onChange={handleChange}
                            value={Customer.cust_nm_e || ''}
                            name='cust_nm_e'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.cust_nm_short')}
                            onChange={handleChange}
                            value={Customer.cust_nm_short || ''}
                            name='cust_nm_short'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={6}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.address')}
                            onChange={handleChange}
                            value={Customer.address || ''}
                            name='address'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.phone')}
                            onChange={handleChange}
                            value={Customer.phone || ''}
                            name='phone'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.fax')}
                            onChange={handleChange}
                            value={Customer.fax || ''}
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
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.email')}
                            onChange={handleChange}
                            value={Customer.email || ''}
                            name='email'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.website')}
                            onChange={handleChange}
                            value={Customer.website || ''}
                            name='website'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.tax_cd')}
                            onChange={handleChange}
                            value={Customer.tax_cd || ''}
                            name='tax_cd'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.bank_acnt_no')}
                            onChange={handleChange}
                            value={Customer.bank_acnt_no || ''}
                            name='bank_acnt_no'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.bank_acnt_nm')}
                            onChange={handleChange}
                            value={Customer.bank_acnt_nm || ''}
                            name='bank_acnt_nm'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.bank_cd')}
                            onChange={handleChange}
                            value={Customer.bank_cd || ''}
                            name='bank_cd'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl margin="dense" variant="outlined" className='w-100'>
                            <InputLabel id="default_yn">{t('partner.customer.default_yn')}</InputLabel>
                            <Select
                                labelId="default_yn"
                                id="default_yn-select"
                                value={Customer.default_yn || 'Y'}
                                onChange={handleChange}
                                label={t('partner.customer.default_yn')}
                                name='default_yn'
                            >
                                <MenuItem value="Y">{t('yes')}</MenuItem>
                                <MenuItem value="N">{t('no')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl margin="dense" variant="outlined" className='w-100'>
                            <InputLabel id="cust_tp">{t('partner.customer.cust_tp')}</InputLabel>
                            <Select
                                labelId="cust_tp"
                                id="cust_tp-select"
                                value={Customer.cust_tp || '1'}
                                onChange={handleChange}
                                label={t('partner.customer.cust_tp')}
                                name='cust_tp'
                            >
                                <MenuItem value="1">{t('partner.customer.individual_customers')}</MenuItem>
                                <MenuItem value="2">{t('partner.customer.institutional_customers')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.cust_tp === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_nm')}
                            onChange={handleChange}
                            value={Customer.agent_nm || ''}
                            name='agent_nm'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.cust_tp === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_fun')}
                            onChange={handleChange}
                            value={Customer.agent_fun || ''}
                            name='agent_fun'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.cust_tp === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_phone')}
                            onChange={handleChange}
                            value={Customer.agent_phone || ''}
                            name='agent_phone'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.cust_tp === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_email')}
                            onChange={handleChange}
                            value={Customer.agent_email || ''}
                            name='agent_email'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            disabled={Customer.agent_nm === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('partner.customer.agent_address')}
                            onChange={handleChange}
                            value={Customer.agent_address || ''}
                            name='agent_address'
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
                        handleCreate(false, Customer);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
                <Button
                    onClick={() => {
                        handleCreate(true, Customer);
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

export default CustomerAdd