import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField';
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
    }
}

const Unit_Autocomplete = ({ onSelect, label, style, size, value, unitID = null, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = ['units', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, resultUnitDropDownList, true, handleTimeOut)

        // const unitSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
        //     if (msg) {
        //         const cltSeqResult = msg['REQUEST_SEQ']
        //         if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
        //             return
        //         }
        //         const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
        //         if (reqInfoMap == null || reqInfoMap === undefined) {
        //             return
        //         }
        //         if (reqInfoMap.reqFunct === reqFunction.UNIT_DROPDOWN_LIST) {
        //             resultUnitDropDownList(msg, cltSeqResult, reqInfoMap)
        //         }
        //     }
        // })
        // return () => {
        //     unitSub.unsubscribe()
        // }
    }, [])

    useEffect(() => {
        if (!!unitID && unitID !== 0) {
            setValueSelect(dataSource.find(x => x.o_1 === unitID))
        }else{
            setValueSelect({})
        }
    }, [unitID])

    useEffect(() => {
        if (value !== null || value !== undefined) {
            setValueSelect(dataSource.find(x => x.o_2 === value))
        }
    }, [value, dataSource])

    const resultUnitDropDownList = (reqInfoMap, message = {}) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
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
            disabled={disabled}
            onChange={onChange}
            onInputChange={handleChangeInput}
            size={!!size ? size : 'small'}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect}
            getOptionLabel={(option) => option.o_2 || ''}
            style={style}
            renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default Unit_Autocomplete