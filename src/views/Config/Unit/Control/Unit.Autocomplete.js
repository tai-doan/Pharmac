import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SnackBarService from '../../../../utils/service/snackbar_service';
import sendRequest from '../../../../utils/service/sendReq';
import reqFunction from '../../../../utils/constan/functions';
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.UNIT_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    }
}

const Unit_Autocomplete = ({ onSelect, label, style, size, value, unitID = null, disabled = false, onKeyPress = () => null, inputRef = null }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = ['units', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, resultUnitDropDownList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (!!unitID && unitID !== 0) {
            let item = dataSource.find(x => x.o_1 === unitID)
            setValueSelect(item)
            setInputValue(!!item ? item.o_2 : '')
        } else if (value !== null || value !== undefined) {
            let item = dataSource.find(x => x.o_2 === value)
            setValueSelect(item)
            setInputValue(value)
        } else {
            setValueSelect({})
            setInputValue('')
        }
    }, [unitID, value, dataSource])

    // useEffect(() => {
    //     if (value !== null || value !== undefined) {
    //         let item = dataSource.find(x => x.o_2 === value)
    //         setValueSelect(item)
    //         setInputValue(value)
    //     } else {
    //         setValueSelect({})
    //     }
    // }, [value, dataSource])

    // useEffect(() => {
    //     if (!!unitID && unitID !== 0) {
    //         let item = dataSource.find(x => x.o_1 === unitID)
    //         console.log('unitID: ', unitID, dataSource, item)
    //         setValueSelect(item)
    //         setInputValue(!!item ? item.o_2 : '')
    //     } else {
    //         setValueSelect({})
    //         setInputValue('')
    //     }
    // }, [unitID, dataSource])

    const resultUnitDropDownList = (reqInfoMap, message = {}) => {
        if (message['PROC_STATUS'] !== 1) {
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
            onKeyPress={onKeyPress}
            // autoSelect={true}
            autoHighlight={true}
            autoComplete={true}
            size={!!size ? size : 'small'}
            noOptionsText={t('noData')}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect}
            getOptionLabel={(option) => option.o_2 || ''}
            style={style}
            renderInput={(params) => <TextField inputRef={inputRef} value={inputValue} {...params} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default Unit_Autocomplete