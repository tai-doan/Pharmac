import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import NumberFormat from 'react-number-format'
import { Card, CardHeader, CardContent, CardActions, Chip, Grid, Button, TextField, Dialog } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import WarnTimeAutocompelte from './Control/WarnTime.Autocomplete'
import Dictionary from '../../../components/Dictionary/index'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
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
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => { handleCreate(); saveContinue.current = true }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false);
        setWarnTime({})
        setProductSelect('')
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    const handleResultCreate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            setWarnTime({})
            setProductSelect('')
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
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [warnTime.product, Number(warnTime.warn_amt), warnTime.warn_time_tp]
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultCreate, true, handleTimeOut)
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
                maxWidth="sm"
                open={shouldOpenModal}
                // onClose={e => {
                //     setShouldOpenModal(false)
                // }}
            >
                <Card>
                    <CardHeader title={t('config.warnTime.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Product_Autocomplete
                                    autoFocus={true}
                                    value={productSelect || ''}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                    inputRef={step1Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step2Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
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
                                    inputRef={step2Ref}
                                    onFocus={e => e.target.select()}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <WarnTimeAutocompelte
                                    defaultSelect={true}
                                    value={warnTime.warn_time_nm || ''}
                                    diectionName='warn_time_tp'
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('config.warnTime.warn_time_tp')}
                                    onSelect={handleChangeTimeTp}
                                    inputRef={step3Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleCreate();
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