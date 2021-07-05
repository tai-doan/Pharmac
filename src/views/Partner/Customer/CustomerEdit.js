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
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/Customer.modal'
import { requestInfo } from '../../../utils/models/requestInfo'

const serviceInfo = {
    GET_CUSTOMER_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const CustomerEdit = ({ id, shouldOpenEditModal, handleCloseEditModal, handleUpdate }) => {
    const { t } = useTranslation()

    const [Customer, setCustomer] = useState({})

    useEffect(() => {
        const CustomerSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.CUSTOMER_BY_ID) {
                    resultGetCustomerByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            CustomerSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_CUSTOMER_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetCustomerByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setCustomer(newData.rows[0])
        }
    }

    const checkValidate = () => {
        if (!!Customer.o_1 && !!Customer.o_2) {
            return false
        }
        return true
    }

    const handleSelectUnit = obj => {
        const newCustomer = { ...Customer };
        newCustomer['o_4'] = !!obj ? obj?.o_1 : null
        setCustomer(newCustomer)
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
            open={shouldOpenEditModal}
            onClose={e => {
                handleCloseEditModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('partner.customer.titleEdit', { name: Customer.o_3 })}
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
                            value={Customer.o_2 || ''}
                            name='o_2'
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
                            value={Customer.o_3 || ''}
                            name='o_3'
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
                            value={Customer.o_4 || ''}
                            name='o_4'
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
                            value={Customer.o_5 || ''}
                            name='o_5'
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
                            value={Customer.o_6 || ''}
                            name='o_6'
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
                            value={Customer.o_7 || ''}
                            name='o_7'
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
                            value={Customer.o_8 || ''}
                            name='o_8'
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
                            value={Customer.o_9 || ''}
                            name='o_9'
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
                            value={Customer.o_10 || ''}
                            name='o_10'
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
                            value={Customer.o_11 || ''}
                            name='o_11'
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
                            value={Customer.o_12 || ''}
                            name='o_12'
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
                            value={Customer.o_13 || ''}
                            name='o_13'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl margin="dense" variant="outlined" className='w-100'>
                            <InputLabel id="default_yn">{t('partner.customer.default_yn')}</InputLabel>
                            <Select
                                labelId="default_yn"
                                id="default_yn-select"
                                value={Customer.o_22 || 'Y'}
                                onChange={handleChange}
                                label={t('partner.customer.default_yn')}
                                name='o_22'
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
                                value={Customer.o_23 || '1'}
                                onChange={handleChange}
                                label={t('partner.customer.cust_tp')}
                                name='o_23'
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
                            disabled={Customer.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_nm')}
                            onChange={handleChange}
                            value={Customer.o_15 || ''}
                            name='o_15'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_fun')}
                            onChange={handleChange}
                            value={Customer.o_16 || ''}
                            name='o_16'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_phone')}
                            onChange={handleChange}
                            value={Customer.o_18 || ''}
                            name='o_18'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Customer.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.customer.agent_email')}
                            onChange={handleChange}
                            value={Customer.o_19 || ''}
                            name='o_19'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            disabled={Customer.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('partner.customer.agent_address')}
                            onChange={handleChange}
                            value={Customer.o_17 || ''}
                            name='o_17'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseEditModal(false);
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
                <Button
                    onClick={() => {
                        handleUpdate(Customer);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default CustomerEdit