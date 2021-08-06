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
        reqFunct: reqFunction.USER_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    }
}

const User_Autocomplete = ({ onSelect = () => null, label = '', style = {}, size = 'small', value = '', userID = null, disabled = false, onKeyPress = () => null, inputRef = null, autoSelectOnce = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = ['users', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, resultUserDropDownList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (!!userID && userID !== 0) {
            let item = dataSource.find(x => x.o_1 === userID)
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
    }, [userID, value, dataSource])

    const resultUserDropDownList = (reqInfoMap, message = {}) => {
        if (message['PROC_STATUS'] !== 1) {
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            const userValidated = newData.rows.filter(x => x.o_2 !== glb_sv.userId)
            setDataSource(userValidated)
            if (autoSelectOnce && userValidated.length > 0 && !userID && !value) {
                setValueSelect(userValidated[0])
                onSelect(userValidated[0])
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

export default User_Autocomplete