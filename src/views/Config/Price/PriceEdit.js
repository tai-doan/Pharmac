import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import NumberFormat from 'react-number-format'
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
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'

const serviceInfo = {
    GET_PRICE_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const PriceEdit = ({ id, shouldOpenEditModal, handleCloseEditModal, handleUpdate }) => {
    const { t } = useTranslation()

    const [Price, setPrice] = useState({})
    const [unitSelect, setUnitSelect] = useState('')

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
            setUnitSelect(newData.rows[0].o_5)
        }
    }

    const checkValidate = () => {
        if (!!Price.o_1 && !!Price.o_2 && !!Price.o_4 && !!Price.o_6 && !!Price.o_7 && !!Price.o_8 && !!Price.o_9 && !!Price.o_10) {
            return false
        }
        return true
    }

    const handleSelectUnit = obj => {
        const newPrice = { ...Price };
        newPrice['o_4'] = !!obj ? obj?.o_1 : null
        setUnitSelect(!!obj ? obj?.o_2 : '')
        setPrice(newPrice)
    }

    const handleChange = e => {
        const newPrice = { ...Price };
        newPrice[e.target.name] = e.target.value
        setPrice(newPrice)
    }

    const handleImportPriceChange = value => {
        const newPrice = { ...Price };
        newPrice['o_6'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }
    const handleImportVATChange = value => {
        const newPrice = { ...Price };
        newPrice['o_7'] = Math.round(value.floatValue) >= 0 && Math.round(value.floatValue) <= 100 ? Math.round(value.floatValue) : 10
        setPrice(newPrice)
    }
    const handlePriceChange = value => {
        const newPrice = { ...Price };
        newPrice['o_8'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }
    const handleWholePriceChange = value => {
        const newPrice = { ...Price };
        newPrice['o_9'] = Math.round(value.floatValue)
        setPrice(newPrice)
    }

    const handleExportVATChange = value => {
        const newPrice = { ...Price };
        newPrice['o_10'] = Math.round(value.floatValue) >= 0 && Math.round(value.floatValue) <= 100 ? Math.round(value.floatValue) : 10
        setPrice(newPrice)
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
            <Card>
                <CardHeader title={t('config.price.titleEdit', { name: Price.o_3 })} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <Product_Autocomplete
                                disabled={true}
                                value={Price.o_3}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.product')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Unit_Autocomplete
                                value={unitSelect}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <NumberFormat
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
                                onValueChange={handleImportPriceChange}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <NumberFormat
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
                                onValueChange={handleImportVATChange}
                                inputProps={{
                                    min: 0,
                                    max: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
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
                                onValueChange={handlePriceChange}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
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
                                onValueChange={handleWholePriceChange}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs>
                            <NumberFormat
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
                                onValueChange={handleExportVATChange}
                                inputProps={{
                                    min: 0,
                                    max: 100
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('config.price.note')}
                            onChange={handleChange}
                            value={Price.o_11 || ''}
                            name='o_11'
                            variant="outlined"
                        />
                    </Grid>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
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
                            handleUpdate(Price);
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
    )
}

export default PriceEdit