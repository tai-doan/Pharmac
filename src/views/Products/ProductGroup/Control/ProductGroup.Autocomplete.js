import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import SnackBarService from '../../../../utils/service/snackbar_service'
import sendRequest from '../../../../utils/service/sendReq'
import reqFunction from '../../../../utils/constan/functions'
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.PRODUCT_GROUP_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
}

const ProductGroup_Autocomplete = ({ onSelect, label, style, size, value, productGroupID, disabled = false, autoFocus = false, onKeyPress = () => null, inputRef = null }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const inputParam = ['groups', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, handleResultProductGroupDropDownList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (value) {
            sendRequest(serviceInfo.GET_PRODUCT_GROUP_BY_ID, [value], null, true, handleTimeOut)
        }
    }, [value])

    useEffect(() => {
        if (!!productGroupID && productGroupID !== 0) {
            let item = dataSource.find(x => x.o_1 === productGroupID)
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
    }, [productGroupID, value, dataSource])

    const handleResultProductGroupDropDownList = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setDataSource(newData.rows)
            let productGroupRequireEnterExp = newData.rows.filter(x => x.o_2 === 'DƯỢC PHẨM')
            if (productGroupRequireEnterExp.length > 0) {
                glb_sv.defaultProductGroupId = [productGroupRequireEnterExp[0]?.o_1]
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
            onChange={onChange}
            onInputChange={handleChangeInput}
            onKeyPress={onKeyPress}
            disabled={disabled}
            size={!!size ? size : 'small'}
            noOptionsText={t('noData')}
            id="combo-box-demo"
            options={dataSource}
            value={valueSelect || {}}
            getOptionLabel={(option) => option.o_2 || ''}
            style={style}
            // autoSelect={true}
            autoHighlight={true}
            autoComplete={true}
            renderInput={(params) => <TextField inputRef={inputRef} value={inputValue} {...params} autoFocus={autoFocus} label={!!label ? label : ''} variant="outlined" />}
        />
    )
}

export default ProductGroup_Autocomplete