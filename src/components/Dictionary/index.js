import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SnackBarService from '../../utils/service/snackbar_service';
import sendRequest from '../../utils/service/sendReq';
import reqFunction from '../../utils/constan/functions';
import { requestInfo } from '../../utils/models/requestInfo';
import glb_sv from '../../utils/service/global_service'
import control_sv from '../../utils/service/control_services'
import socket_sv from '../../utils/service/socket_service'

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'dictionary',
        reqFunct: reqFunction.DICTIONARY,
        biz: 'common',
        object: 'dropdown_list'
    }
}

const Dictionary = ({ diectionName, onSelect, label, style, size, value, required = false, dictionaryID = null, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = [diectionName || 'bank_cd']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, e => console.log('result ', e), true, handleTimeOut)

        const dictionnarySub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.DICTIONARY) {
                    resultDictionnaryDropDownList(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            dictionnarySub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!!dictionaryID && dictionaryID !== 0) {
            setValueSelect(dataSource.find(x => x.o_1 === dictionaryID))
        } else {
            setValueSelect({})
        }
    }, [dictionaryID, dataSource])

    useEffect(() => {
        if (value !== null || value !== undefined) {
            setValueSelect(dataSource.find(x => x.o_2 === value))
        }
    }, [value, dataSource])

    const resultDictionnaryDropDownList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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

    return (
        <Autocomplete
            margin="dense"
            disabled={disabled}
            onChange={onChange}
            onInputChange={handleChangeInput}
            size={!!size ? size : 'small'}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect}
            getOptionLabel={(option) => option.o_2 || ''}
            inputValue={value}
            style={style}
            renderInput={(params) => <TextField required={required} {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default Dictionary