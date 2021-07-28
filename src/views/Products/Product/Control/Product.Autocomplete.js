import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SnackBarService from '../../../../utils/service/snackbar_service';
import sendRequest from '../../../../utils/service/sendReq';
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import reqFunction from '../../../../utils/constan/functions';
import { requestInfo } from '../../../../utils/models/requestInfo';

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.PRODUCT_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    }
}

const Product_Autocomplete = ({ onSelect = () => null, label, style, size, value, productID = null, onKeyPress = () => null, disabled = false, autoFocus = false, openOnFocus = false, inputRef = null }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = ['products', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, resultProductDropDownList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (!!value || value !== null || value !== undefined) {
            let item = dataSource.find(x => x.o_2 === value)
            setValueSelect(item)
            setInputValue(value)
        } else {
            setValueSelect({})
        }
    }, [value, dataSource])

    useEffect(() => {
        if (!!productID && productID !== 0) {
            let item = dataSource.find(x => x.o_1 === productID)
            setValueSelect(item)
            setInputValue(!!item ? item.o_2 : '')
        } else {
            setValueSelect({})
            setInputValue('')
        }
    }, [productID])

    const resultProductDropDownList = (reqInfoMap, message = {}) => {
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
            onChange={onChange}
            onInputChange={handleChangeInput}
            onKeyPress={onKeyPress}
            disabled={disabled}
            size={!!size ? size : 'small'}
            noOptionsText={t('noData')}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect}
            // autoSelect={true}
            autoHighlight={true}
            autoComplete={true}
            getOptionLabel={(option) => option.o_2 || ''}
            style={style}
            openOnFocus={openOnFocus}
            renderInput={(params) => <TextField inputRef={inputRef} value={inputValue} autoFocus={autoFocus || (!!inputRef ? true : false)} {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default Product_Autocomplete