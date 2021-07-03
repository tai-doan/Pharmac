import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import sendRequest from '../../../utils/service/sendReq';
import reqFunction from '../../../utils/constan/functions';
import { requestInfo } from '../../../utils/models/requestInfo';
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service';
import { config } from './Modal/ProductGroup.modal'

const serviceInfo = {
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

const ProductGroupEdit = ({ id, shouldOpenModal, handleCloseEditModal, productGroupNameFocus, productGroupNoteFocus, handleUpdate }) => {
    const { t } = useTranslation()

    const [productGroup, setProductGroup] = useState({})

    useEffect(() => {
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
        if (id) {
            sendRequest(serviceInfo.GET_PRODUCT_GROUP_BY_ID, [id], null, true, handleTimeOut)
        }
    }, [id])

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
            setProductGroup(newData.rows[0])
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
    }

    const checkValidate = () => {
        if (!!productGroup.o_2) {
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
            maxWidth="md"
            open={shouldOpenModal}
            onClose={e => {
                handleCloseEditModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('products.productGroup.titleEdit', { name: productGroup?.o_2 })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <TextField
                    fullWidth={true}
                    required
                    autoFocus
                    inputRef={productGroupNameFocus}
                    autoComplete="off"
                    margin="dense"
                    label={t('products.productGroup.name')}
                    onChange={handleChange}
                    value={productGroup.o_2 || ''}
                    name='o_2'
                    variant="outlined"
                    className="uppercaseInput"
                    onKeyPress={event => {
                        if (event.key === 'Enter') {
                            handleUpdate(false, productGroup)
                        }
                    }}
                />

                <TextField
                    fullWidth={true}
                    margin="dense"
                    multiline
                    rows={2}
                    inputRef={productGroupNoteFocus}
                    autoComplete="off"
                    label={t('products.productGroup.note')}
                    onChange={handleChange}
                    value={productGroup.o_3 || ''}
                    name='o_3'
                    variant="outlined"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseEditModal(false);
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
                <Button
                    onClick={() => {
                        handleUpdate(false, productGroup);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ProductGroupEdit