import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SnackBarService from '../../../../utils/service/snackbar_service';
import sendRequest from '../../../../utils/service/sendReq';
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import { config } from '../Modal/Customer.modal'

const serviceInfo = {
    GET_ALL: {
        moduleName: config.moduleName,
        screenName: config.screenName,
        functionName: config['list'].functionName,
        reqFunct: config['list'].reqFunct,
        operation: config['list'].operation,
        biz: config.biz,
        object: config.object
    },
    GET_UNIT_BY_ID: {
        moduleName: config.moduleName,
        screenName: config.screenName,
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        operation: config['byId'].operation,
        biz: config.biz,
        object: config.object
    }
}

const Customer_Autocomplete = ({ onSelect, label, style, size, value, onKeyPress = () => null, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = [glb_sv.defaultValueSearch, '%']
        sendRequest(serviceInfo.GET_ALL, inputParam, resultGetList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (value !== null || value !== undefined) {
            sendRequest(serviceInfo.GET_UNIT_BY_ID, [value], resultGetCustomerByID, true, handleTimeOut)
        }
    }, [value])

    const resultGetCustomerByID = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setValueSelect(newData.rows[0])
        }
    }

    const resultGetList = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let newDataSource = dataSource.concat(newData.rows)
            setDataSource(newDataSource)
            if (newDataSource.length < newData.rowTotal) {
                const inputParam = [newDataSource[newDataSource.length - 1].o_1, '%']
                sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)
            }
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
            onKeyPress={onKeyPress}
            size={!!size ? size : 'small'}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect}
            getOptionLabel={(option) => option.o_2 || ''}
            style={style}
            // autoSelect={true}
            autoHighlight={true}
            autoComplete={true}
            renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default Customer_Autocomplete