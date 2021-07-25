import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    Card, CardHeader, CardContent, CardActions, Select, FormControl, MenuItem, InputLabel, TextField, Grid, Button, Dialog
} from '@material-ui/core'

import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service';
import reqFunction from '../../../utils/constan/functions';
import { requestInfo } from '../../../utils/models/requestInfo'

import { config, defaultModalAdd } from './Modal/Customer.modal'
import Dictionary from '../../../components/Dictionary'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_CUSTOMER_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    UPDATE: {
        functionName: config['update'].functionName,
        reqFunct: config['update'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const CustomerEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [Customer, setCustomer] = useState(defaultModalAdd)
    const [process, setProcess] = useState(false)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setCustomer({ ...defaultModalAdd }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.CUSTOMER_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.CUSTOMER_BY_ID:
                        resultGetCustomerByID(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            CustomerSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal && id !== 0) {
            sendRequest(serviceInfo.GET_CUSTOMER_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [shouldOpenModal])

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

    const resultUpdate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            setCustomer({ ...defaultModalAdd })
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (!Customer?.o_1 || !Customer?.o_2?.trim()) return
        setProcess(true)
        const inputParam = [
            Customer.o_1, //id
            Customer.o_2, //tên tv
            Customer.o_3, //tên ta
            Customer.o_4, //tên ngắn
            Customer.o_5, //địa chỉ
            Customer.o_6, //sđt
            Customer.o_7, //fax
            Customer.o_8, //email
            Customer.o_9, //web
            Customer.o_10, //tax
            Customer.o_11, //tk ngân hàng
            Customer.o_12, //tên tk ngân hàng
            Customer.o_13, //mã ngân hàng
            Customer.o_15, //tên người đại diện
            Customer.o_16, //chức vụ
            Customer.o_17, //địa chỉ
            Customer.o_18, //sđt
            Customer.o_19, //email
            Customer.o_22, //xét mặc định
            Customer.o_23 //phân loại KH
        ];
        sendRequest(serviceInfo.UPDATE, inputParam, null, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const checkValidate = () => {
        if (!!Customer.o_1 && !!Customer.o_2.trim()) {
            return false
        }
        return true
    }

    const handleSelectBank = obj => {
        const newCustomer = { ...Customer };
        newCustomer['o_13'] = !!obj ? obj?.o_1 : null
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
            open={shouldOpenModal}
            // onClose={e => {
            //     setShouldOpenModal(false)
            //     setCustomer({ ...defaultModalAdd })
            // }}
        >
            <Card>
                <CardHeader title={t('partner.customer.titleEdit', { name: Customer.o_3 })} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                className="uppercaseInput"
                                required={true}
                                autoComplete="off"
                                label={t('partner.customer.cust_nm_v')}
                                onChange={handleChange}
                                value={Customer.o_2 || ''}
                                name='o_2'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.address')}
                                onChange={handleChange}
                                value={Customer.o_5 || ''}
                                name='o_5'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.phone')}
                                onChange={handleChange}
                                value={Customer.o_6 || ''}
                                name='o_6'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.fax')}
                                onChange={handleChange}
                                value={Customer.o_7 || ''}
                                name='o_7'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.email')}
                                onChange={handleChange}
                                value={Customer.o_8 || ''}
                                name='o_8'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.website')}
                                onChange={handleChange}
                                value={Customer.o_9 || ''}
                                name='o_9'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.tax_cd')}
                                onChange={handleChange}
                                value={Customer.o_10 || ''}
                                name='o_10'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.bank_acnt_no')}
                                onChange={handleChange}
                                value={Customer.o_11 || ''}
                                name='o_11'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.bank_acnt_nm')}
                                onChange={handleChange}
                                value={Customer.o_12 || ''}
                                name='o_12'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Dictionary
                                value={Customer.o_14}
                                diectionName='bank_cd'
                                onSelect={handleSelectBank}
                                label={t('partner.supplier.bank_cd')}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
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
                                autoComplete="off"
                                label={t('partner.customer.agent_nm')}
                                onChange={handleChange}
                                value={Customer.o_15 || ''}
                                name='o_15'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Customer.o_23 === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.agent_fun')}
                                onChange={handleChange}
                                value={Customer.o_16 || ''}
                                name='o_16'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Customer.o_23 === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.agent_phone')}
                                onChange={handleChange}
                                value={Customer.o_18 || ''}
                                name='o_18'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                disabled={Customer.o_23 === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.customer.agent_email')}
                                onChange={handleChange}
                                value={Customer.o_19 || ''}
                                name='o_19'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
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
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            setShouldOpenModal(false);
                            setCustomer({ ...defaultModalAdd })
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleUpdate(Customer);
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                        endIcon={process && <LoopIcon />}
                    >
                        {t('btn.update')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default CustomerEdit