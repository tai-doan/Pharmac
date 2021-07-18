import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardHeader, CardContent, CardActions, TextField, Button, Dialog, Tooltip, Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import SnackBarService from '../../../../utils/service/snackbar_service';
import sendRequest from '../../../../utils/service/sendReq';
import reqFunction from '../../../../utils/constan/functions';
import { requestInfo } from '../../../../utils/models/requestInfo';
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import Dictionary from '../../../../components/Dictionary';
import { defaultModalAdd } from '../Modal/Customer.modal';

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.CUSTOMER_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
    CREATE_CUSTOMER: {
        functionName: 'insert',
        reqFunct: reqFunction.CUSTOMER_CREATE,
        biz: 'export',
        object: 'customers'
    }
}

const CustomerAdd_Autocomplete = ({ onSelect, onCreate, label, style, size, value, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [customerInfo, setCustomerInfo] = useState({ ...defaultModalAdd })
    const idCreated = useRef(-1)

    useEffect(() => {
        const inputParam = ['customers', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, null, true, handleTimeOut)

        const customerSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.CUSTOMER_DROPDOWN_LIST) {
                    resultCustomerDropDownList(msg, cltSeqResult, reqInfoMap)
                }
                if (reqInfoMap.reqFunct === reqFunction.INS_CUSTOMER) {
                    resultCreateCustomer(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            customerSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (value !== null || value !== undefined) {
            setValueSelect(dataSource.find(x => x.o_2 === value))
        }
        if (idCreated.current !== -1) {
            setValueSelect(dataSource.find(x => x.o_1 === idCreated.current))
            idCreated.current = -1
        }
    }, [value, dataSource])

    const resultCustomerDropDownList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setDataSource(newData.rows)
        }
    }

    const resultCreateCustomer = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            let data = message['PROC_DATA']
            idCreated.current = data.rows[0].o_1;
            onCreate(data.rows[0].o_1)
            setCustomerInfo({ ...defaultModalAdd  })
            setShouldOpenModal(false)
            // Lấy dữ liệu mới nhất
            const inputParam = ['customers', '%']
            sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, e => console.log('result ', e), true, handleTimeOut)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleChangeInput = (event, value, reson) => {
        setInputValue(value)
    }

    const onChange = (event, object, reson) => {
        setValueSelect(object)
        onSelect(object)
    }

    const checkValidate = () => {
        if (!!customerInfo.cust_nm_v && !!customerInfo.cust_nm_v.trim()) {
            return false
        }
        return true
    }

    const handleCreateCustomer = () => {
        const inputParam = [
            customerInfo.cust_nm_v,
            customerInfo.cust_nm_e,
            customerInfo.cust_nm_short,
            customerInfo.address,
            customerInfo.phone,
            customerInfo.fax,
            customerInfo.email,
            customerInfo.website,
            customerInfo.tax_cd,
            customerInfo.bank_acnt_no,
            customerInfo.bank_acnt_nm,
            customerInfo.bank_cd,
            customerInfo.agent_nm,
            customerInfo.agent_fun,
            customerInfo.agent_address,
            customerInfo.agent_phone,
            customerInfo.agent_email,
            customerInfo.default_yn,
            customerInfo.cust_tp
        ]
        sendRequest(serviceInfo.CREATE_CUSTOMER, inputParam, null, true, handleTimeOut)
    }

    const handleChange = e => {
        let newCustomer = { ...customerInfo };
        newCustomer[e.target.name] = e.target.value
        setCustomerInfo(newCustomer)
    }

    const handleSelectBank = obj => {
        let newCustomer = { ...customerInfo };
        newCustomer['bank_cd'] = !!obj ? obj?.o_1 : null
        setCustomerInfo(newCustomer)
    }


    return (
        <>
            <Autocomplete
                disabled={disabled}
                onChange={onChange}
                onInputChange={handleChangeInput}
                size={!!size ? size : 'small'}
                id="combo-box-demo"
                options={dataSource}
                value={valueSelect}
                getOptionLabel={(option) => option.o_2 || ''}
                style={{ marginTop: 8, marginBottom: 4, width: !disabled ? '80%' : '100%' }}
                renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
            />
            {!disabled &&
                <Tooltip title={t('partner.customer.titleAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            }

            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setCustomerInfo({ ...defaultModalAdd })
                }}
            >
                <Card>
                    <CardHeader title={t('partner.customer.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    required={true}
                                    className="uppercaseInput"
                                    autoComplete="off"
                                    label={t('partner.customer.cust_nm_v')}
                                    onChange={handleChange}
                                    value={customerInfo.cust_nm_v || ''}
                                    name='cust_nm_v'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    className="uppercaseInput"
                                    autoComplete="off"
                                    label={t('partner.customer.cust_nm_e')}
                                    onChange={handleChange}
                                    value={customerInfo.cust_nm_e || ''}
                                    name='cust_nm_e'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    className="uppercaseInput"
                                    autoComplete="off"
                                    label={t('partner.customer.cust_nm_short')}
                                    onChange={handleChange}
                                    value={customerInfo.cust_nm_short || ''}
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
                                    autoComplete="off"
                                    label={t('partner.customer.address')}
                                    onChange={handleChange}
                                    value={customerInfo.address || ''}
                                    name='address'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.phone')}
                                    onChange={handleChange}
                                    value={customerInfo.phone || ''}
                                    name='phone'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.fax')}
                                    onChange={handleChange}
                                    value={customerInfo.fax || ''}
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
                                    label={t('partner.customer.email')}
                                    onChange={handleChange}
                                    value={customerInfo.email || ''}
                                    name='email'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.website')}
                                    onChange={handleChange}
                                    value={customerInfo.website || ''}
                                    name='website'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.tax_cd')}
                                    onChange={handleChange}
                                    value={customerInfo.tax_cd || ''}
                                    name='tax_cd'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.bank_acnt_no')}
                                    onChange={handleChange}
                                    value={customerInfo.bank_acnt_no || ''}
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
                                    autoComplete="off"
                                    label={t('partner.customer.bank_acnt_nm')}
                                    onChange={handleChange}
                                    value={customerInfo.bank_acnt_nm || ''}
                                    name='bank_acnt_nm'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Dictionary
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
                                        value={customerInfo.default_yn || 'Y'}
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
                                        value={customerInfo.cust_tp || '1'}
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
                                    disabled={customerInfo.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_nm')}
                                    onChange={handleChange}
                                    value={customerInfo.agent_nm || ''}
                                    name='agent_nm'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={customerInfo.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_fun')}
                                    onChange={handleChange}
                                    value={customerInfo.agent_fun || ''}
                                    name='agent_fun'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={customerInfo.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_phone')}
                                    onChange={handleChange}
                                    value={customerInfo.agent_phone || ''}
                                    name='agent_phone'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={customerInfo.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_email')}
                                    onChange={handleChange}
                                    value={customerInfo.agent_email || ''}
                                    name='agent_email'
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    disabled={customerInfo.agent_nm === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    rows={2}
                                    autoComplete="off"
                                    label={t('partner.customer.agent_address')}
                                    onChange={handleChange}
                                    value={customerInfo.agent_address || ''}
                                    name='agent_address'
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={e => {
                                setShouldOpenModal(false);
                                setCustomerInfo({ ...defaultModalAdd })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleCreateCustomer();
                                setCustomerInfo({ ...defaultModalAdd })
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('btn.save')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog >
        </>
    )
}

export default CustomerAdd_Autocomplete