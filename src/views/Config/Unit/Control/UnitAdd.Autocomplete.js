import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardHeader, CardContent, CardActions, TextField, Button, Dialog, Tooltip } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import SnackBarService from '../../../../utils/service/snackbar_service';
import sendRequest from '../../../../utils/service/sendReq';
import reqFunction from '../../../../utils/constan/functions';
import { requestInfo } from '../../../../utils/models/requestInfo';
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.UNIT_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
    CREATE_UNIT: {
        functionName: 'insert',
        reqFunct: reqFunction.INS_UNIT,
        biz: 'common',
        object: 'units'
    }
}

const UnitAdd_Autocomplete = ({ onSelect, onCreate, label, style, size, value, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [unitInfo, setUnitInfo] = useState({
        name: '',
        note: ''
    })
    const idCreated = useRef(-1)

    useEffect(() => {
        const inputParam = ['units', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, null, true, handleTimeOut)

        const unitSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.UNIT_DROPDOWN_LIST) {
                    resultUnitDropDownList(msg, cltSeqResult, reqInfoMap)
                }
                if (reqInfoMap.reqFunct === reqFunction.INS_UNIT) {
                    resultCreateUnit(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            unitSub.unsubscribe()
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

    const resultUnitDropDownList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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

    const resultCreateUnit = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setUnitInfo({ name: '', note: '' })
            setShouldOpenModal(false)
            // Lấy dữ liệu mới nhất
            const inputParam = ['units', '%']
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
        if (!!unitInfo.name && !!unitInfo.name.trim()) {
            return false
        }
        return true
    }

    const handleChangeUnit = e => {
        let newUnit = { ...unitInfo };
        newUnit[e.target.name] = e.target.value;
        setUnitInfo(newUnit)
    }

    const handleCreateUnit = () => {
        sendRequest(serviceInfo.CREATE_UNIT, [unitInfo.name, unitInfo.note], null, true, handleTimeOut)
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
                <Tooltip title={t('config.unit.titleAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            }

            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setUnitInfo({ name: '', note: '' })
                }}
            >
                <Card>
                    <CardHeader title={t('config.unit.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required={true}
                            autoFocus={true}
                            margin="dense"
                            label={t('config.unit.name')}
                            name='name'
                            onChange={handleChangeUnit}
                            value={unitInfo.name}
                            variant="outlined"
                            className="uppercaseInput"
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    handleCreateUnit()
                                    setUnitInfo({ name: '', note: '' })
                                }
                            }}
                        />

                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline={true}
                            rows={2}
                            name='note'
                            label={t('config.unit.note')}
                            onChange={handleChangeUnit}
                            value={unitInfo.note || ''}
                            variant="outlined"
                        />
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={e => {
                                setShouldOpenModal(false);
                                setUnitInfo({ name: '', note: '' })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleCreateUnit();
                                setUnitInfo({ name: '', note: '' })
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

export default UnitAdd_Autocomplete