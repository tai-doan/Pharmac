import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardHeader, CardContent, CardActions, TextField, Button, Dialog, Tooltip, Grid, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@material-ui/core'
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

const SupplierAdd_Autocomplete = ({ onSelect = () => null, onCreate = () => null, label = '', style = {}, size = 'small', value = null, disabled = false, autoFocus = false }) => {
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
        if (!!supplierInfo.vender_nm_v && !!supplierInfo.vender_nm_v.trim()) {
            return false
        }
        return true
    }

    const handleCreateSupplier = () => {
        if (!supplierInfo.vender_nm_v.trim()) return
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
                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                renderInput={(params) => {
                    let newParams = {
                        ...params, ...{
                            InputProps: {
                                ...params.InputProps,
                                // endAdornment: Object.assign(params.InputProps.endAdornment, (
                                //     <Tooltip title={t('partner.supplier.titleQuickAdd')} aria-label="add">
                                //         <AddCircleIcon style={{ color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                                //     </Tooltip>
                                // )),
                                startAdornment: (
                                    <Tooltip title={t('partner.supplier.titleQuickAdd')} aria-label="add">
                                        <AddCircleIcon style={{ color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                                    </Tooltip>
                                )
                            }
                        }
                    }
                    return <TextField
                        {...newParams}
                        autoFocus={autoFocus}
                        label={!!label ? label : ''}
                        variant="outlined"
                    />
                }}
            />
            {/* {!disabled &&
                <Tooltip title={t('partner.supplier.titleQuickAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            } */}

            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setSupplierInfo({ ...defaultModalAdd })
                }}
            >
                <Card>
                    <CardHeader title={t('partner.supplier.titleQuickAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs>
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
                            <Grid item xs>
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
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <TextField
                                    fullWidth={true}
                                    multiline
                                    rows={2}
                                    rowsMax={5}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('partner.supplier.address')}
                                    onChange={handleChange}
                                    value={supplierInfo.address || ''}
                                    name='address'
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