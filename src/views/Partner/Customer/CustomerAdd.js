import React, { useState, useRef } from 'react'
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
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';

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
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)
    const step9Ref = useRef(null)
    const step10Ref = useRef(null)
    const step11Ref = useRef(null)
    const step12Ref = useRef(null)
    const step13Ref = useRef(null)
    const step14Ref = useRef(null)
    const step15Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setCustomer({ ...defaultModalAdd })
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    const handleResultCreate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            setCustomer({ ...defaultModalAdd })
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (step1Ref.current) step1Ref.current.focus()
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
        setControlTimeOutKey(null)
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
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultCreate, true, handleTimeOut)
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
            // onClose={e => {
            //     setShouldOpenModal(false)
            // }}
            >
                <Card>
                    <CardHeader title={t('partner.customer.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={1}>
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
                                    autoFocus={true}
                                    inputRef={step1Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step2Ref.current.focus()
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
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
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
                                    inputRef={step3Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step4Ref.current.focus()
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
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
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
                                    inputRef={step5Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step6Ref.current.focus()
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
                                    inputRef={step6Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step7Ref.current.focus()
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
                                    inputRef={step7Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step8Ref.current.focus()
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
                                    inputRef={step8Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step9Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
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
                                    inputRef={step9Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step10Ref.current.focus()
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
                                    inputRef={step10Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            if (step11Ref?.current) {
                                                step11Ref.current.focus()
                                            }
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <FormControl inputRef={step11Ref} margin="dense" variant="outlined" className='w-100'>
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
                        <Grid container spacing={1}>
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
                                    inputRef={step11Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step12Ref.current.focus()
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
                                    inputRef={step12Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step13Ref.current.focus()
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
                                    inputRef={step13Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step14Ref.current.focus()
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
                                    inputRef={step14Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step15Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
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
                                    inputRef={step15Ref}
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
                                if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                    return
                                }
                                setCustomer({ ...defaultModalAdd })
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