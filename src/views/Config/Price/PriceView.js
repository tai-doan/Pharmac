import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import NumberFormat from 'react-number-format'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../Unit/Control/Unit.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/Price.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import moment from 'moment'

const serviceInfo = {
    GET_PRICE_BY_ID: {
        moduleName: config.moduleName,
        screenName: config.screenName,
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        operation: config['byId'].operation,
        biz: config.biz,
        object: config.object
    }
}

const PriceView = ({ id, shouldOpenViewModal, handleCloseViewModal }) => {
    const { t } = useTranslation()

    const [Price, setPrice] = useState({})

    useEffect(() => {
        const PriceSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.PRICE_BY_ID) {
                    resultGetPriceByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            PriceSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_PRICE_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetPriceByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setPrice(newData.rows[0])
        }
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenViewModal}
            onClose={e => {
                handleCloseViewModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('config.Price.titleView', { name: Price.o_3 })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <Product_Autocomplete
                            disabled={true}
                            value={Price.o_2}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <Unit_Autocomplete
                            disabled={true}
                            value={Price.o_4}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.configUnit')}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Price.o_6}
                            label={t('config.price.importPrice')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Price.o_7}
                            label={t('config.price.importVAT')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            suffix="%"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Price.o_8}
                            label={t('config.price.price')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Price.o_9}
                            label={t('config.price.wholePrice')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Price.o_10}
                            label={t('config.price.exportVAT')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            suffix="%"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Price.o_10}
                            label={t('config.price.exportVAT')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            suffix="%"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('createdUser')}
                            value={Price.o_12}
                            name="o_12"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('createdDate')}
                            value={moment(Price.o_13, 'DDMMYYYYHHmmss').format('DD/MM/YYYY HH:mm:ss')}
                            name="o_13"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <TextField
                        disabled={true}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('config.price.note')}
                        value={Price.o_11 || ''}
                        name='o_11'
                        variant="outlined"
                    />
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

export default PriceView