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
import { config } from '../Modal/ProductGroup.modal'

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
    GET_PRODUCT_GROUP_BY_ID: {
        moduleName: config.moduleName,
        screenName: config.screenName,
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        operation: config['byId'].operation,
        biz: config.biz,
        object: config.object
    }
}

const ProductGroup_Autocomplete = ({ onSelect, label, style, size, value, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = [glb_sv.defaultValueSearch, '%']
        sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)

        const productGroupSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.PRODUCT_GROUP_LIST) {
                    resultGetList(msg, cltSeqResult, reqInfoMap)
                }
                if (reqInfoMap.reqFunct === reqFunction.PRODUCT_GROUP_BY_ID) {
                    resultGetProductGroupByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            productGroupSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (value) {
            sendRequest(serviceInfo.GET_PRODUCT_GROUP_BY_ID, [value], null, true, handleTimeOut)
        }
    }, [value])

    const resultGetList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            let newDataSource = dataSource.concat(newData.rows)
            setDataSource(newDataSource)
            if (newDataSource.length < newData.rowTotal) {
                const inputParam = [newDataSource[newDataSource.length - 1].o_1, '%']
                sendRequest(serviceInfo.GET_ALL, inputParam, e => console.log('result ', e), true, handleTimeOut)
            }
        }
    }

    const resultGetProductGroupByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setValueSelect(newData.rows[0])
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
            onChange={onChange}
            onInputChange={handleChangeInput}
            disabled={disabled}
            size={!!size ? size : 'small'}
            noOptionsText={t('noData')}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect || {}}
            getOptionLabel={(option) => option.o_2 || ''}
            style={style}
            autoSelect={true}
            autoHighlight={true}
            autoComplete={true}
            renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default ProductGroup_Autocomplete