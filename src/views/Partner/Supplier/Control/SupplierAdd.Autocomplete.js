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
import { defaultModalAdd } from '../Modal/Supplier.modal';

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.SUPPLIER_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
    CREATE_SUPPLIER: {
        functionName: 'insert',
        reqFunct: reqFunction.SUPPLIER_CREATE,
        biz: 'import',
        object: 'venders'
    }
}

const SupplierAdd_Autocomplete = ({ onSelect, onCreate, label, style, size, value, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [supplierInfo, setSupplierInfo] = useState({ ...defaultModalAdd })
    const idCreated = useRef(-1)

    useEffect(() => {
        const inputParam = ['venders', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, null, true, handleTimeOut)

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
                if (reqInfoMap.reqFunct === reqFunction.SUPPLIER_DROPDOWN_LIST) {
                    resultSupplierDropDownList(msg, cltSeqResult, reqInfoMap)
                }
                if (reqInfoMap.reqFunct === reqFunction.SUPPLIER_CREATE) {
                    resultCreateSupplier(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            supplierSub.unsubscribe()
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

    const resultSupplierDropDownList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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

    const resultCreateSupplier = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setSupplierInfo({ ...defaultModalAdd })
            setShouldOpenModal(false)
            // Lấy dữ liệu mới nhất
            const inputParam = ['venders', '%']
            sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, e => console.log('result ', e), true, handleTimeOut)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
    }

    const handleChangeInput = (event, value, reson) => {
        setInputValue(value)
    }

    const onChange = (event, object, reson) => {
        setValueSelect(object)
        onSelect(object)
    }

    const checkValidate = () => {
        if (!!supplierInfo.vender_nm_v && !!supplierInfo.vender_nm_v.trim()) {
            return false
        }
        return true
    }

    const handleCreateSupplier = () => {
        const inputParam = [
            supplierInfo.vender_nm_v.trim(),
            supplierInfo.vender_nm_e.trim(),
            supplierInfo.vender_nm_short.trim(),
            supplierInfo.address,
            supplierInfo.phone,
            supplierInfo.fax,
            supplierInfo.email,
            supplierInfo.website,
            supplierInfo.tax_cd,
            supplierInfo.bank_acnt_no,
            supplierInfo.bank_acnt_nm,
            supplierInfo.bank_cd,
            supplierInfo.agent_nm,
            supplierInfo.agent_fun,
            supplierInfo.agent_address,
            supplierInfo.agent_phone,
            supplierInfo.agent_email,
            supplierInfo.default_yn
        ]
        sendRequest(serviceInfo.CREATE_SUPPLIER, inputParam, null, true, handleTimeOut)
    }

    const handleChange = e => {
        let newSupplier = { ...supplierInfo };
        newSupplier[e.target.name] = e.target.value
        setSupplierInfo(newSupplier)
    }

    const handleSelectBank = obj => {
        let newSupplier = { ...supplierInfo };
        newSupplier['bank_cd'] = !!obj ? obj?.o_1 : null
        setSupplierInfo(newSupplier)
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
                <Tooltip title={t('partner.supplier.titleAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            }

            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setSupplierInfo({ ...defaultModalAdd })
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
                                    value={supplierInfo.vender_nm_v || ''}
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
                                    value={supplierInfo.vender_nm_e || ''}
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
                                    value={supplierInfo.vender_nm_short || ''}
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
                                    value={supplierInfo.address || ''}
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
                                    value={supplierInfo.phone || ''}
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
                                    value={supplierInfo.fax || ''}
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
                                    value={supplierInfo.email || ''}
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
                                    value={supplierInfo.website || ''}
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
                                    value={supplierInfo.tax_cd || ''}
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
                                    value={supplierInfo.bank_acnt_no || ''}
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
                                    value={supplierInfo.bank_acnt_nm || ''}
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
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="default_yn">{t('partner.supplier.default_yn')}</InputLabel>
                                    <Select
                                        labelId="default_yn"
                                        id="default_yn-select"
                                        value={supplierInfo.default_yn || 'Y'}
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
                                    disabled={supplierInfo.vender_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.supplier.agent_nm')}
                                    onChange={handleChange}
                                    value={supplierInfo.agent_nm || ''}
                                    name='agent_nm'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={supplierInfo.vender_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.supplier.agent_fun')}
                                    onChange={handleChange}
                                    value={supplierInfo.agent_fun || ''}
                                    name='agent_fun'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={supplierInfo.vender_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.supplier.agent_phone')}
                                    onChange={handleChange}
                                    value={supplierInfo.agent_phone || ''}
                                    name='agent_phone'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    disabled={supplierInfo.vender_tp === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.supplier.agent_email')}
                                    onChange={handleChange}
                                    value={supplierInfo.agent_email || ''}
                                    name='agent_email'
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    disabled={supplierInfo.agent_nm === '1'}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    rows={2}
                                    autoComplete="off"
                                    label={t('partner.supplier.agent_address')}
                                    onChange={handleChange}
                                    value={supplierInfo.agent_address || ''}
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
                                setSupplierInfo({ ...defaultModalAdd })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleCreateSupplier();
                                setSupplierInfo({ ...defaultModalAdd })
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

export default SupplierAdd_Autocomplete