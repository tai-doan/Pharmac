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
    GET_LOT_NO_LIST: {
        functionName: 'get_lotno',
        reqFunct: reqFunction.LOT_NO_BY_PRODUCT,
        biz: 'import',
        object: 'imp_invoices'
    }
}

const LotNoByProduct_Autocomplete = ({ productID, onSelect, label, size, value, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const lotNoSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.LOT_NO_BY_PRODUCT) {
                    resultLotNoByProductDropdownList(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            lotNoSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!!productID && productID !== -1) {
            const inputParam = [productID, 'Y']
            sendRequest(serviceInfo.GET_LOT_NO_LIST, inputParam, e => console.log('result ', e), true, handleTimeOut)
        } else {
            setValueSelect({})
        }
    }, [productID])

    useEffect(() => {
        if (value !== null || value !== undefined) {
            setValueSelect(dataSource.find(x => x.o_3 === value))
        }
    }, [value, dataSource])

    const resultLotNoByProductDropdownList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            console.log('data số lô: ', newData)
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
            getOptionLabel={(option) => option.o_3 || ''}
            inputValue={value}
            style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
            renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default LotNoByProduct_Autocomplete