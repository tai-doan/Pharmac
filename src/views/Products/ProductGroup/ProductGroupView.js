import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Grid } from '@material-ui/core'
import { config } from './Modal/ProductGroup.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import moment from 'moment'

const serviceInfo = {
    GET_PRODUCT_GROUP_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const ProductGroupView = ({ id, shouldOpenModal, handleCloseViewModal }) => {
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
            setProductGroup({})
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_PRODUCT_GROUP_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetProductGroupByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setProductGroup(newData.rows[0]);
        }
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            onClose={e => {
                handleCloseViewModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('viewDetail', { name: productGroup?.o_2 })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container className="{}" spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth={true}
                            disabled={true}
                            required
                            autoFocus
                            autoComplete="off"
                            margin="dense"
                            label={t('products.productGroup.name')}
                            value={productGroup?.o_2}
                            variant="outlined"
                            className="uppercaseInput"
                        />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <TextField
                            fullWidth={true}
                            disabled={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('products.productGroup.note')}
                            value={productGroup?.o_3 || ''}
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={2} sm={2}>
                        <RadioGroup aria-label="products.productGroup.main_group" name="main-group" value={'Y'} defaultValue={'Y'}>
                            <FormControlLabel disabled={true} value={productGroup.o_4} control={<Radio />} label={t('products.productGroup.isMain')} />
                        </RadioGroup>
                    </Grid>
                </Grid>
                <Grid container className="{}" spacing={2}>
                    <Grid item xs>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('createdUser')}
                            value={productGroup.o_5}
                            name="o_5"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('createdDate')}
                            value={moment(productGroup.o_6, 'DDMMYYYYHHmmss').format('DD/MM/YYYY HH:mm:ss')}
                            name="o_6"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('titleBranch')}
                            value={productGroup.o_7}
                            name="o_7"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>


            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseViewModal(false);
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ProductGroupView