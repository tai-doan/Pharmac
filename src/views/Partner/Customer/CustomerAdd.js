import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    Card, CardHeader, CardContent, CardActions, Select, FormControl, MenuItem, InputLabel, TextField, Grid, Button, Dialog, Chip
} from '@material-ui/core'
import { defaultModalAdd } from './Modal/Customer.modal';
import Dictionary from '../../../components/Dictionary'

import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import { requestInfo } from '../../../utils/models/requestInfo'

import AddIcon from '@material-ui/icons/Add';
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.CUSTOMER_CREATE,
        biz: 'export',
        object: 'customers'
    }
}

const CustomerAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [Customer, setCustomer] = useState({ ...defaultModalAdd })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const inputRef = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setCustomer({ ...defaultModalAdd })
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
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
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.CUSTOMER_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            customerSub.unsubscribe()
        }
    }, [])

    const resultCreate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (inputRef.current) inputRef.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const handleCreate = () => {
        if (!Customer.cust_nm_v.trim()) return
        setProcess(true)
        const inputParam = [
            Customer.cust_nm_v,
            Customer.cust_nm_e,
            Customer.cust_nm_short,
            Customer.address,
            Customer.phone,
            Customer.fax,
            Customer.email,
            Customer.website,
            Customer.tax_cd,
            Customer.bank_acnt_no,
            Customer.bank_acnt_nm,
            Customer.bank_cd,
            Customer.agent_nm,
            Customer.agent_fun,
            Customer.agent_address,
            Customer.agent_phone,
            Customer.agent_email,
            Customer.default_yn,
            Customer.cust_tp
        ];
        sendRequest(serviceInfo.CREATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!Customer.cust_nm_v.trim()) {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newCustomer = { ...Customer };
        newCustomer[e.target.name] = e.target.value
        setCustomer(newCustomer)
    }

    const handleSelectBank = obj => {
        const newCustomer = { ...Customer };
        newCustomer['bank_cd'] = !!obj ? obj?.o_1 : null
        setCustomer(newCustomer)
    }

    return (
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('partner.customer.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    required={true}
                                    className="uppercaseInput"
                                    autoComplete="off"
                                    label={t('partner.customer.cust_nm_v')}
                                    onChange={handleChange}
                                    value={Customer.cust_nm_v || ''}
                                    name='cust_nm_v'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.address || ''}
                                    name='address'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.phone || ''}
                                    name='phone'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.fax || ''}
                                    name='fax'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.email || ''}
                                    name='email'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.website || ''}
                                    name='website'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.tax_cd || ''}
                                    name='tax_cd'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.bank_acnt_no || ''}
                                    name='bank_acnt_no'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                                    value={Customer.bank_acnt_nm || ''}
                                    name='bank_acnt_nm'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
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
                                    autoComplete="off"
                                    label={t('partner.customer.agent_nm')}
                                    onChange={handleChange}
                                    value={Customer.agent_nm || ''}
                                    name='agent_nm'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={Customer.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_fun')}
                                    onChange={handleChange}
                                    value={Customer.agent_fun || ''}
                                    name='agent_fun'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={Customer.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_phone')}
                                    onChange={handleChange}
                                    value={Customer.agent_phone || ''}
                                    name='agent_phone'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={Customer.cust_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.customer.agent_email')}
                                    onChange={handleChange}
                                    value={Customer.agent_email || ''}
                                    name='agent_email'
                                    variant="outlined"
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    disabled={Customer.cust_tp === '1'}
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
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
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleCreate(false, Customer);
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('btn.save')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleCreate(true, Customer);
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog >
        </>
    )
}

export default CustomerAdd