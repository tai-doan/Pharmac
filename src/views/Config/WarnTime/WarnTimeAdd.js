import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import NumberFormat from 'react-number-format'
import { Card, CardHeader, CardContent, CardActions, Chip, Grid, Button, TextField, Dialog } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Dictionary from '../../../components/Dictionary/index'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import AddIcon from '@material-ui/icons/Add';
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.WARN_TIME_CREATE,
        biz: 'common',
        object: 'conf_expiredt'
    }
}

const WarnTimeAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [warnTime, setWarnTime] = useState({})
    const [productSelect, setProductSelect] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const inputRef = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleCreate(); saveContinue.current = true }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false);
        setWarnTime({})
        setProductSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const warnTimeSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.WARN_TIME_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            warnTimeSub.unsubscribe()
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
            setWarnTime({})
            setProductSelect('')
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
        if (!warnTime.product || !warnTime.warn_amt || warnTime.warn_amt <= 0 || !warnTime.warn_time_tp) return
        setProcess(true)
        const inputParam = [warnTime.product, Number(warnTime.warn_amt), warnTime.warn_time_tp]
        sendRequest(serviceInfo.CREATE, inputParam, null, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!warnTime.product && !!warnTime.warn_amt && warnTime.warn_amt > 0 && !!warnTime.warn_time_tp) {
            return false
        }
        return true
    }

    const handleSelectProduct = obj => {
        const newWarnTime = { ...warnTime };
        newWarnTime['product'] = !!obj ? obj?.o_1 : null
        setWarnTime(newWarnTime)
        setProductSelect(!!obj ? obj?.o_2 : '')
    }

    const handleChangeAmt = value => {
        const newWarnTime = { ...warnTime };
        newWarnTime['warn_amt'] = Number(value.value) >= 0 && Number(value.value) <= 100 ? Number(value.value) : 1
        setWarnTime(newWarnTime)
    }

    const handleChangeTimeTp = obj => {
        const newWarnTime = { ...warnTime };
        newWarnTime['warn_time_tp'] = !!obj ? obj?.o_1 : null
        newWarnTime['warn_time_nm'] = !!obj ? obj?.o_2 : ''
        setWarnTime(newWarnTime)
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
                    <CardHeader title={t('config.warnTime.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <Product_Autocomplete
                                    autoFocus={true}
                                    value={productSelect || ''}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat className='inputNumber' 
                                    style={{ width: '100%' }}
                                    required
                                    value={warnTime.warn_amt || ''}
                                    label={t('config.warnTime.warn_amt')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handleChangeAmt}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <Dictionary
                                    value={warnTime.warn_time_nm || ''}
                                    diectionName='warn_time_tp'
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('config.warnTime.warn_time_tp')}
                                    onSelect={handleChangeTimeTp}
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

export default WarnTimeAdd