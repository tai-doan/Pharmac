import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import NumberFormat from 'react-number-format'
import {
    Card, CardHeader, CardContent, CardActions, FormControl, TextField, Grid, Button, Dialog, InputLabel, MenuItem, Select
} from '@material-ui/core'
import sendRequest from '../../../utils/service/sendReq'
import SnackBarService from '../../../utils/service/snackbar_service'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { settlementDefaulModal } from './Modal/Export.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import { useHotkeys } from 'react-hotkeys-hook'

import LoopIcon from '@material-ui/icons/Loop';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import Dictionary from '../../../components/Dictionary'

const serviceInfo = {
    GET_SETTLEMENT_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_BY_ID,
        biz: 'settlement',
        object: 'exp_settl'
    },
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_UPDATE,
        biz: 'settlement',
        object: 'exp_settl'
    }
}

const ExportEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [settlement, setSettlement] = useState({})
    const [process, setProcess] = useState(false)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setSettlement(settlementDefaulModal) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const settlementSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.SETTLEMENT_EXPORT_UPDATE:
                        resultUpdate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SETTLEMENT_EXPORT_BY_ID:
                        resultGetSettlementByID(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            settlementSub.unsubscribe()
            setSettlement({})
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            sendRequest(serviceInfo.GET_SETTLEMENT_BY_ID, [id], null, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const resultGetSettlementByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            let newConvertData = {
                settle_id: newData.rows[0].o_1, // id
                invoice_no: newData.rows[0].o_4,
                settl_tp: newData.rows[0].o_7, // group id
                settl_tp_nm: newData.rows[0].o_8, // group id
                settl_dt: moment(newData.rows[0].o_9).toString(), // name
                settl_dt_ip: newData.rows[0].o_10, // barcode
                bank_act_s: newData.rows[0].o_11, // unit id
                bank_act_nm_s: newData.rows[0].o_12, // contents
                bank_cd_s: newData.rows[0].o_13, // contraid
                bank_nm_s: newData.rows[0].o_14, // designate
                bank_act_r: newData.rows[0].o_15, // dosage
                bank_act_nm_r: newData.rows[0].o_16, // interact
                bank_cd_r: newData.rows[0].o_17, // manufact
                bank_nm_r: newData.rows[0].o_18, // effect
                note: newData.rows[0].o_19, // overdose
                settl_amt: newData.rows[0].o_20
            }
            setSettlement(newConvertData)
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
        if (message['PROC_STATUS'] !== 1) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        } else {
            setSettlement(settlementDefaulModal)
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (!settlement?.settle_id || !settlement?.settl_tp || settlement?.settl_amt <= 0) return
        setProcess(true)
        let inputParam = [
            settlement.settle_id,
            settlement.settl_tp,
            moment().format('YYYYMMDD'),
            settlement.settl_amt,
            settlement.bank_act_s,
            settlement.bank_act_nm_s,
            settlement.bank_cd_s,
            settlement.bank_act_r,
            settlement.bank_act_nm_r,
            settlement.bank_cd_r,
            settlement.note
        ]
        sendRequest(serviceInfo.UPDATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (settlement?.settle_id && !!settlement?.settl_tp && !!settlement.settl_amt && settlement?.settl_amt > 0) {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newSettlement = { ...settlement };
        newSettlement[e.target.name] = e.target.value;
        if (e.target.name === 'settl_tp' && e.target.value === '1') {
            newSettlement['bank_act_s'] = ''
            newSettlement['bank_act_nm_s'] = ''
            newSettlement['bank_cd_s'] = null
            newSettlement['bank_nm_s'] = ''
            newSettlement['bank_act_r'] = ''
            newSettlement['bank_act_nm_r'] = ''
            newSettlement['bank_cd_r'] = null
            newSettlement['bank_nm_r'] = ''
            setSettlement(newSettlement)
        } else {
            setSettlement(newSettlement)
        }
    }

    const handleDateChange = date => {
        const newSettlement = { ...settlement };
        newSettlement['settl_dt'] = date;
        setSettlement(newSettlement)
    }

    const handleAmountChange = value => {
        const newSettlement = { ...settlement };
        newSettlement['settl_amt'] = Number(value.value)
        setSettlement(newSettlement)
    }

    const handleSelectTransfBank = obj => {
        const newSettlement = { ...settlement };
        newSettlement['bank_cd_s'] = !!obj ? obj?.o_1 : null
        newSettlement['bank_transf_name_s'] = !!obj ? obj?.o_2 : null
        setSettlement(newSettlement)
    }

    const handleSelectReceiBank = obj => {
        const newSettlement = { ...settlement };
        newSettlement['bank_cd_r'] = !!obj ? obj?.o_1 : null
        newSettlement['bank_recei_name_s'] = !!obj ? obj?.o_2 : null
        setSettlement(newSettlement)
    }

    return (

        < Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            onClose={(e) => {
                setShouldOpenModal(false)
                setSettlement(settlementDefaulModal)
            }}
        >
            <Card>
                <CardHeader title={t('settlement.titleEditExport')} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                disabled={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('settlement.invoice_no')}
                                value={settlement.invoice_no}
                                name="invoice_no"
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <FormControl margin="dense" variant="outlined" className='w-100'>
                                <InputLabel id="settl_tp">{t('settlement.settl_tp')}</InputLabel>
                                <Select
                                    labelId="settl_tp"
                                    id="settl_tp-select"
                                    value={settlement.settl_tp || '1'}
                                    onChange={handleChange}
                                    label={t('settlement.payment_type')}
                                    name='settl_tp'
                                >
                                    <MenuItem value="1">{t('settlement.cash')}</MenuItem>
                                    <MenuItem value="2">{t('settlement.bank_transfer')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    margin="dense"
                                    variant="outlined"
                                    style={{ width: '100%' }}
                                    inputVariant="outlined"
                                    format="dd/MM/yyyy"
                                    id="settl_dt-picker-inline"
                                    label={t('settlement.settl_dt')}
                                    value={settlement.settl_dt}
                                    onChange={handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <NumberFormat className='inputNumber' 
                                style={{ width: '100%' }}
                                required
                                value={settlement.settl_amt}
                                label={t('settlement.settl_amt')}
                                customInput={TextField}
                                onValueChange={handleAmountChange}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
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
                            <Dictionary
                                value={settlement.bank_nm_s || ''}
                                disabled={settlement.settl_tp === '1'}
                                required={settlement.settl_tp === '2'}
                                diectionName='bank_cd'
                                onSelect={handleSelectTransfBank}
                                label={t('report.bank_transf_name')}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                            />
                        </Grid>

                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                disabled={settlement.settl_tp === '1'}
                                required={settlement.settl_tp === '2'}
                                margin="dense"
                                autoComplete="off"
                                label={t('report.bank_transf_acc_name')}
                                onChange={handleChange}
                                value={settlement.bank_act_s}
                                name="bank_act_s"
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                disabled={settlement.settl_tp === '1'}
                                required={settlement.settl_tp === '2'}
                                autoComplete="off"
                                label={t('report.bank_transf_acc_number')}
                                onChange={handleChange}
                                value={settlement.bank_act_nm_s}
                                name="bank_act_nm_s"
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
                                value={settlement.bank_nm_r || ''}
                                disabled={settlement.settl_tp === '1'}
                                required={settlement.settl_tp === '2'}
                                diectionName='bank_cd'
                                onSelect={handleSelectReceiBank}
                                label={t('report.bank_recei_name')}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                            />
                        </Grid>

                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                disabled={settlement.settl_tp === '1'}
                                required={settlement.settl_tp === '2'}
                                autoComplete="off"
                                label={t('report.bank_recei_acc_name')}
                                onChange={handleChange}
                                value={settlement.bank_act_r}
                                name="bank_act_r"
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                disabled={settlement.settl_tp === '1'}
                                required={settlement.settl_tp === '2'}
                                autoComplete="off"
                                label={t('report.bank_recei_acc_number')}
                                onChange={handleChange}
                                value={settlement.bank_act_nm_r}
                                name="bank_act_nm_r"
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
                        onClick={(e) => {
                            setShouldOpenModal(false)
                            setSettlement({})
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => handleUpdate()}
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

export default ExportEdit