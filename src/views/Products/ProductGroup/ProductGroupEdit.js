import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';
import { Card, CardHeader, CardContent, CardActions, Button, TextField, Dialog } from '@material-ui/core'

import sendRequest from '../../../utils/service/sendReq';
import reqFunction from '../../../utils/constan/functions';
import { requestInfo } from '../../../utils/models/requestInfo';
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service';
import { config } from './Modal/ProductGroup.modal'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_PRODUCT_GROUP_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    UPDATE: {
        functionName: config['update'].functionName,
        reqFunct: config['update'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const ProductGroupEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [productGroup, setProductGroup] = useState({})
    const [process, setProcess] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setProductGroup({}) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && id !== 0) {
            sendRequest(serviceInfo.GET_PRODUCT_GROUP_BY_ID, [id], handleResultGetProductByID, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    const handleResultGetProductByID = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setProductGroup(newData.rows[0])
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        }
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            setProductGroup({})
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (!productGroup?.o_1 || productGroup?.o_2?.trim().length <= 0) return
        setProcess(true)
        const inputParam = [productGroup.o_1, productGroup.o_2, productGroup.o_3]
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const checkValidate = () => {
        if (!!productGroup || productGroup.o_2.trim() !== '') {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newProductGroup = { ...productGroup };
        newProductGroup[e.target.name] = e.target.value;
        setProductGroup(newProductGroup)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={shouldOpenModal}
        // onClose={e => {
        //     setShouldOpenModal(false)
        //     setProductGroup({})
        // }}
        >
            <Card>
                <CardHeader title={t('products.productGroup.titleEdit', { name: productGroup?.o_2 })} />
                <CardContent>
                    <TextField
                        fullWidth={true}
                        required={true}
                        autoComplete="off"
                        margin="dense"
                        label={t('products.productGroup.name')}
                        onChange={handleChange}
                        value={productGroup.o_2 || ''}
                        name='o_2'
                        variant="outlined"
                        className="uppercaseInput"
                        inputRef={step1Ref}
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                step2Ref.current.focus()
                            }
                        }}
                    />

                    <TextField
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('products.productGroup.note')}
                        onChange={handleChange}
                        value={productGroup.o_3 || ''}
                        name='o_3'
                        variant="outlined"
                        inputRef={step2Ref}
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                handleUpdate()
                            }
                        }}
                    />
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                return
                            }
                            setShouldOpenModal(false);
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleUpdate();
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                        endIcon={process && <LoopIcon />}
                    >
                        {t('btn.update')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default ProductGroupEdit