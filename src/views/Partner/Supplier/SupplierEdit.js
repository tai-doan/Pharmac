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

import { config, defaultModalAdd } from './Modal/Supplier.modal'
import Dictionary from '../../../components/Dictionary'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_SUPPLIER_BY_ID: {
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

const SupplierEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [Supplier, setSupplier] = useState({})
    const [process, setProcess] = useState(false)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setSupplier({ ...defaultModalAdd }) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.SUPPLIER_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SUPPLIER_BY_ID:
                        resultGetSupplierByID(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            SupplierSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal && id !== 0) {
            sendRequest(serviceInfo.GET_SUPPLIER_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [shouldOpenModal])

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
            setSupplier({ ...defaultModalAdd })
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (!Supplier?.o_1 || !Supplier?.o_2?.trim()) return
        setProcess(true)
        const inputParam = [
            Supplier.o_1, //id
            Supplier.o_2.trim(), //tên tv
            Supplier.o_3, //tên ta
            Supplier.o_4, //tên ngắn
            Supplier.o_5, //địa chỉ
            Supplier.o_6, //sđt
            Supplier.o_7, //fax
            Supplier.o_8, //email
            Supplier.o_9, //web
            Supplier.o_10, //taxt
            Supplier.o_11, //tk ngân hàng
            Supplier.o_12, //tên tk ngân hàng
            Supplier.o_13, //mã ngân hàng
            Supplier.o_15, //tên người đại diện
            Supplier.o_16, //chức vụ
            Supplier.o_17, //địa chỉ
            Supplier.o_18, //sđt
            Supplier.o_19, //email
            Supplier.o_22 //xét mặc định
        ];
        sendRequest(serviceInfo.UPDATE, inputParam, null, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const checkValidate = () => {
        if (!!Supplier.o_1 && !!Supplier.o_2.trim()) {
            return false
        }
        return true
    }

    const handleSelectBank = obj => {
        const newSupplier = { ...Supplier };
        newSupplier['o_13'] = !!obj ? obj?.o_1 : null
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
            open={shouldOpenModal}
            // onClose={e => {
            //     setShouldOpenModal(false)
            // }}
        >
            <Card>
                <CardHeader title={t('partner.supplier.titleEdit', { name: Supplier.o_3 })} />
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
                                value={Supplier.o_2 || ''}
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
                                label={t('partner.supplier.address')}
                                onChange={handleChange}
                                value={Supplier.o_5 || ''}
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
                                label={t('partner.supplier.phone')}
                                onChange={handleChange}
                                value={Supplier.o_6 || ''}
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
                                label={t('partner.supplier.fax')}
                                onChange={handleChange}
                                value={Supplier.o_7 || ''}
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
                                label={t('partner.supplier.email')}
                                onChange={handleChange}
                                value={Supplier.o_8 || ''}
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
                                label={t('partner.supplier.website')}
                                onChange={handleChange}
                                value={Supplier.o_9 || ''}
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
                                label={t('partner.supplier.tax_cd')}
                                onChange={handleChange}
                                value={Supplier.o_10 || ''}
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
                                label={t('partner.supplier.bank_acnt_no')}
                                onChange={handleChange}
                                value={Supplier.o_11 || ''}
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
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.bank_acnt_nm')}
                                onChange={handleChange}
                                value={Supplier.o_12 || ''}
                                name='o_12'
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Dictionary
                                value={Supplier.o_14}
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
                                autoComplete="off"
                                label={t('partner.supplier.agent_nm')}
                                onChange={handleChange}
                                value={Supplier.o_15 || ''}
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
                                disabled={Supplier.o_23 === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_fun')}
                                onChange={handleChange}
                                value={Supplier.o_16 || ''}
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
                                disabled={Supplier.o_23 === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_phone')}
                                onChange={handleChange}
                                value={Supplier.o_18 || ''}
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
                                disabled={Supplier.o_23 === '1'}
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('partner.supplier.agent_email')}
                                onChange={handleChange}
                                value={Supplier.o_19 || ''}
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
                            setSupplier({ ...defaultModalAdd })
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleUpdate();
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

export default SupplierEdit