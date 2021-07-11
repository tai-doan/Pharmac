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
        reqFunct: reqFunction.PRODUCT_GROUP_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
    CREATE_PRODUCT_GROUP: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_GROUP_ADD,
        biz: 'common',
        object: 'groups'
    }
}

const ProductGroupAdd_Autocomplete = ({ onSelect, onCreate, label, style, size, value, disabled = false }) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [productGroupInfo, setProductGroupInfo] = useState({
        name: '',
        note: ''
    })
    const idCreated = useRef(-1)

    useEffect(() => {
        const inputParam = ['groups', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, null, true, handleTimeOut)

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
                if (reqInfoMap.reqFunct === reqFunction.PRODUCT_GROUP_DROPDOWN_LIST) {
                    resultProductGroupDropDownList(msg, cltSeqResult, reqInfoMap)
                }
                if (reqInfoMap.reqFunct === reqFunction.PRODUCT_GROUP_ADD) {
                    resultCreateProductGroup(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            productGroupSub.unsubscribe()
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

    const resultProductGroupDropDownList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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

    const resultCreateProductGroup = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setProductGroupInfo({ name: '', note: '' })
            setShouldOpenModal(false)
            // Lấy dữ liệu mới nhất
            const inputParam = ['groups', '%']
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
        if (!!productGroupInfo.name && !!productGroupInfo.name.trim()) {
            return false
        }
        return true
    }

    const handleChangeProductGroup = e => {
        let newProductGroup = { ...productGroupInfo };
        newProductGroup[e.target.name] = e.target.value;
        setProductGroupInfo(newProductGroup)
    }

    const handleCreateProductGroup = () => {
        sendRequest(serviceInfo.CREATE_PRODUCT_GROUP, [productGroupInfo.name, productGroupInfo.note], null, true, handleTimeOut)
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
                <Tooltip title={t('products.productGroup.titleAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            }

            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                    setProductGroupInfo({ name: '', note: '' })
                }}
            >
                <Card>
                    <CardHeader title={t('products.productGroup.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required={true}
                            autoFocus={true}
                            margin="dense"
                            label={t('products.productGroup.name')}
                            name='name'
                            onChange={handleChangeProductGroup}
                            value={productGroupInfo.name}
                            variant="outlined"
                            className="uppercaseInput"
                            onKeyPress={event => {
                                if (event.key === 'Enter') {
                                    handleCreateProductGroup()
                                    setProductGroupInfo({ name: '', note: '' })
                                }
                            }}
                        />

                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline={true}
                            rows={2}
                            name='note'
                            label={t('products.productGroup.note')}
                            onChange={handleChangeProductGroup}
                            value={productGroupInfo.note || ''}
                            variant="outlined"
                        />
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={e => {
                                setShouldOpenModal(false);
                                setProductGroupInfo({ name: '', note: '' })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button
                            onClick={() => {
                                handleCreateProductGroup();
                                setProductGroupInfo({ name: '', note: '' })
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

export default ProductGroupAdd_Autocomplete