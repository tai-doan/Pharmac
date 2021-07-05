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
import { config } from './Modal/UnitRate.modal'
import { requestInfo } from '../../../utils/models/requestInfo'

const serviceInfo = {
    GET_UNIT_RATE_BY_ID: {
        moduleName: config.moduleName,
        screenName: config.screenName,
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        operation: config['byId'].operation,
        biz: config.biz,
        object: config.object
    }
}

const UnitRateEdit = ({ id, shouldOpenEditModal, handleCloseEditModal, handleUpdate }) => {
    const { t } = useTranslation()

    const [unitRate, setUnitRate] = useState({})

    useEffect(() => {
        const unitRateSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.UNIT_RATE_BY_ID) {
                    resultGetUnitRateByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            unitRateSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_UNIT_RATE_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetUnitRateByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setUnitRate(newData.rows[0])
        }
    }

    const checkValidate = () => {
        if (unitRate.o_6 && unitRate.o_6 > 0) {
            return false
        }
        return true
    }

    const handleChange = value => {
        const newUnitRate = { ...unitRate };
        newUnitRate['o_6'] = Math.round(value.floatValue)
        setUnitRate(newUnitRate)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenEditModal}
            onClose={e => {
                handleCloseEditModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('config.unitRate.titleEdit', { name: unitRate.o_3 })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container className="{}" spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <Product_Autocomplete
                            disabled={true}
                            value={unitRate.o_3}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.product')}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <Unit_Autocomplete
                            disabled={true}
                            value={unitRate.o_5}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.configUnit')}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <NumberFormat
                            style={{ width: '100%' }}
                            required
                            value={unitRate.o_6}
                            label={t('config.unitRate.rate')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            onValueChange={handleChange}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                </Grid>
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
                        handleUpdate(unitRate);
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

export default UnitRateEdit