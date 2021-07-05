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
import { config } from './Modal/Supplier.modal'
import { requestInfo } from '../../../utils/models/requestInfo'

const serviceInfo = {
    GET_CUSTOMER_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const SupplierEdit = ({ id, shouldOpenEditModal, handleCloseEditModal, handleUpdate }) => {
    const { t } = useTranslation()

    const [Supplier, setSupplier] = useState({})

    useEffect(() => {
        const SupplierSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    resultGetSupplierByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            SupplierSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_CUSTOMER_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetSupplierByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setSupplier(newData.rows[0])
        }
    }

    const checkValidate = () => {
        if (!!Supplier.o_1 && !!Supplier.o_2) {
            return false
        }
        return true
    }

    const handleSelectUnit = obj => {
        const newSupplier = { ...Supplier };
        newSupplier['o_4'] = !!obj ? obj?.o_1 : null
        setSupplier(newSupplier)
    }

    const handleChange = e => {
        const newSupplier = { ...Supplier };
        newSupplier[e.target.name] = e.target.value
        setSupplier(newSupplier)
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
                {t('partner.supplier.titleEdit', { name: Supplier.o_3 })}
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
                            label={t('partner.supplier.vender_nm_v')}
                            onChange={handleChange}
                            value={Supplier.o_2 || ''}
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
                            label={t('partner.supplier.vender_nm_e')}
                            onChange={handleChange}
                            value={Supplier.o_3 || ''}
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
                            label={t('partner.supplier.vender_nm_short')}
                            onChange={handleChange}
                            value={Supplier.o_4 || ''}
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
                            label={t('partner.supplier.address')}
                            onChange={handleChange}
                            value={Supplier.o_5 || ''}
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
                            label={t('partner.supplier.phone')}
                            onChange={handleChange}
                            value={Supplier.o_6 || ''}
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
                            label={t('partner.supplier.fax')}
                            onChange={handleChange}
                            value={Supplier.o_7 || ''}
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
                            label={t('partner.supplier.email')}
                            onChange={handleChange}
                            value={Supplier.o_8 || ''}
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
                            label={t('partner.supplier.website')}
                            onChange={handleChange}
                            value={Supplier.o_9 || ''}
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
                            label={t('partner.supplier.tax_cd')}
                            onChange={handleChange}
                            value={Supplier.o_10 || ''}
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
                            label={t('partner.supplier.bank_acnt_no')}
                            onChange={handleChange}
                            value={Supplier.o_11 || ''}
                            name='o_11'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.supplier.bank_acnt_nm')}
                            onChange={handleChange}
                            value={Supplier.o_12 || ''}
                            name='o_12'
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
                            label={t('partner.supplier.bank_cd')}
                            onChange={handleChange}
                            value={Supplier.o_13 || ''}
                            name='o_13'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <FormControl margin="dense" variant="outlined" className='w-100'>
                            <InputLabel id="default_yn">{t('partner.supplier.default_yn')}</InputLabel>
                            <Select
                                labelId="default_yn"
                                id="default_yn-select"
                                value={Supplier.o_22 || 'Y'}
                                onChange={handleChange}
                                label={t('partner.supplier.default_yn')}
                                name='o_22'
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
                            disabled={Supplier.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.supplier.agent_nm')}
                            onChange={handleChange}
                            value={Supplier.o_15 || ''}
                            name='o_15'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Supplier.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.supplier.agent_fun')}
                            onChange={handleChange}
                            value={Supplier.o_16 || ''}
                            name='o_16'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Supplier.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.supplier.agent_phone')}
                            onChange={handleChange}
                            value={Supplier.o_18 || ''}
                            name='o_18'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={Supplier.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('partner.supplier.agent_email')}
                            onChange={handleChange}
                            value={Supplier.o_19 || ''}
                            name='o_19'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            disabled={Supplier.o_23 === '1'}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('partner.supplier.agent_address')}
                            onChange={handleChange}
                            value={Supplier.o_17 || ''}
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
                        handleUpdate(Supplier);
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

export default SupplierEdit