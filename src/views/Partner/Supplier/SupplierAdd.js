import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    Card, CardHeader, CardContent, CardActions, IconButton, Chip, Select, FormControl, MenuItem, InputLabel, TextField, Grid, Button, Dialog
} from '@material-ui/core'
import { defaultModalAdd } from './Modal/Supplier.modal';
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
        reqFunct: reqFunction.SUPPLIER_DELETE,
        biz: 'import',
        object: 'venders'
    }
}

const SupplierAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [Supplier, setSupplier] = useState({ ...defaultModalAdd })
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const inputRef = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setSupplier({ ...defaultModalAdd })
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const supplierSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.SUPPLIER_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            supplierSub.unsubscribe()
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
            setSupplier({ ...defaultModalAdd })
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
        if (!Supplier.cust_nm_v.trim()) return
        setProcess(true)
        const inputParam = [
            Supplier.vender_nm_v,
            Supplier.vender_nm_e,
            Supplier.vender_nm_short,
            Supplier.address,
            Supplier.phone,
            Supplier.fax,
            Supplier.email,
            Supplier.website,
            Supplier.tax_cd,
            Supplier.bank_acnt_no,
            Supplier.bank_acnt_nm,
            Supplier.bank_cd,
            Supplier.agent_nm,
            Supplier.agent_fun,
            Supplier.agent_address,
            Supplier.agent_phone,
            Supplier.agent_email,
            Supplier.default_yn
        ];
        sendRequest(serviceInfo.CREATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!Supplier.vender_nm_v.trim()) {
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
                    <CardHeader title={t('partner.supplier.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
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
                                    label={t('partner.supplier.address')}
                                    onChange={handleChange}
                                    value={Supplier.address || ''}
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
                                    label={t('partner.supplier.phone')}
                                    onChange={handleChange}
                                    value={Supplier.phone || ''}
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
                                    label={t('partner.supplier.fax')}
                                    onChange={handleChange}
                                    value={Supplier.fax || ''}
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
                                    label={t('partner.supplier.email')}
                                    onChange={handleChange}
                                    value={Supplier.email || ''}
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
                                    label={t('partner.supplier.website')}
                                    onChange={handleChange}
                                    value={Supplier.website || ''}
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
                                    label={t('partner.supplier.tax_cd')}
                                    onChange={handleChange}
                                    value={Supplier.tax_cd || ''}
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
                                    label={t('partner.supplier.bank_acnt_no')}
                                    onChange={handleChange}
                                    value={Supplier.bank_acnt_no || ''}
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Dictionary
                                    diectionName='bank_cd'
                                    onSelect={handleSelectBank}
                                    label={t('partner.supplier.bank_cd')}
                                    style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                />
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
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
                                setSupplier({ ...defaultModalAdd })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                handleCreate();
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
                                saveContinue.current = true
                                handleCreate();
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

export default SupplierAdd