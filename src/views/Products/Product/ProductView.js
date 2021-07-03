import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'

import ProductGroup_Autocomplete from '../ProductGroup/Control/ProductGroup.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/Product.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import moment from 'moment'

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        moduleName: config.moduleName,
        screenName: config.screenName,
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        operation: config['byId'].operation,
        biz: config.biz,
        object: config.object
    }
}

const ProductView = ({ id, productNameFocus, shouldOpenModal, handleCloseViewModal }) => {
    const { t } = useTranslation()

    const [product, setProduct] = useState({})
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const productSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.PRODUCT_BY_ID) {
                    resultGetProductByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            productSub.unsubscribe()
            setProduct({})
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_PRODUCT_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetProductByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            let newConvertData = {
                o_1: newData.rows[0].o_1, // id
                o_2: newData.rows[0].o_2, // group id
                o_3: newData.rows[0].o_5, // name
                o_4: newData.rows[0].o_6, // barcode
                o_5: newData.rows[0].o_17, // unit id
                o_6: newData.rows[0].o_7, // contents
                o_7: newData.rows[0].o_8, // contraid
                o_8: newData.rows[0].o_9, // designate
                o_9: newData.rows[0].o_10, // dosage
                o_10: newData.rows[0].o_11, // interact
                o_11: newData.rows[0].o_12, // manufact
                o_12: newData.rows[0].o_13, // effect
                o_13: newData.rows[0].o_14, // overdose
                o_14: newData.rows[0].o_16, // storages
                o_15: newData.rows[0].o_15, // packing
                o_16: newData.rows[0].o_4, // code
                o_17: newData.rows[0].o_19, // user
                o_18: newData.rows[0].o_20, // time
                o_19: newData.rows[0].o_21, // branch
            }
            setProduct(newConvertData)
        }
    }

    const handleChangeExpand = () => {
        setIsExpanded(e => !e)
    }

    return (

        < Dialog
            fullWidth={true}
            maxWidth="lg"
            open={shouldOpenModal}
            onClose={(e) => {
                handleCloseViewModal(false)
                setProduct({})
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('viewDetail', { name: product.o_3 })}
            </DialogTitle>
            <DialogContent className={' pt-0'}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Tooltip placement="top" title={t('product.tooltip.productCode')} arrow>
                            <TextField
                                fullWidth={true}
                                autoComplete="off"
                                margin="dense"
                                label={t('products.product.code')}
                                value={product.o_16}
                                name="o_16"
                                disabled={true}
                                variant="outlined"
                                className="uppercaseInput"
                            />
                        </Tooltip>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth={true}
                            required
                            autoFocus
                            autoComplete="off"
                            margin="dense"
                            label={t('products.product.name')}
                            disabled={true}
                            value={product.o_3}
                            name="o_3"
                            variant="outlined"
                            className="uppercaseInput"
                        />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <ProductGroup_Autocomplete
                            disabled={true}
                            value={product.o_2}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.productGroup')}
                        />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Unit_Autocomplete
                            disabled={true}
                            value={product.o_5}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.configUnit')}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Tooltip placement="top" title={t('product.tooltip.barcode')} arrow>
                            <TextField
                                disabled={true}
                                fullWidth={true}
                                autoComplete="off"
                                margin="dense"
                                label={t('products.product.barcode')}
                                value={product.o_4}
                                name="o_4"
                                variant="outlined"
                            />
                        </Tooltip>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('products.product.packing')}
                            value={product.o_15}
                            name="o_15"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={6} sm={6}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('products.product.content')}
                            value={product.o_6}
                            name="o_6"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>

                <Accordion expanded={isExpanded} onChange={handleChangeExpand}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                        height="50px"
                    >
                        <Typography className={''}>{t('product.infoExpand')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="pt-0 pb-0">
                        <Grid container className={''} spacing={2}>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.designate')}
                                    value={product.o_8}
                                    name="o_8"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.contraind')}
                                    value={product.o_7}
                                    name="o_7"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                    <AccordionDetails className="pt-0 pb-0">
                        <Grid container className="{}" spacing={2}>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.dosage')}
                                    value={product.o_9}
                                    name="o_9"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.manufact')}
                                    value={product.o_11}
                                    name="o_11"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                    <AccordionDetails className="pt-0 pb-0">
                        <Grid container className={''} spacing={2}>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.interact')}
                                    value={product.o_10}
                                    name="o_10"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.storages')}
                                    value={product.o_14}
                                    name="o_14"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                    <AccordionDetails className="pt-0">
                        <Grid container className="{}" spacing={2}>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.effect')}
                                    value={product.o_12}
                                    name="o_12"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('products.product.overdose')}
                                    value={product.o_13}
                                    name="o_13"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                    <AccordionDetails className="pt-0">
                        <Grid container className="{}" spacing={2}>
                            <Grid item xs>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    autoComplete="off"
                                    label={t('createdUser')}
                                    value={product.o_17}
                                    name="o_17"
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
                                    value={moment(product.o_18, 'DDMMYYYYHHmmss').format('DD/MM/YYYY HH:mm:ss')}
                                    name="o_18"
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
                                    value={product.o_19}
                                    name="o_19"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={(e) => {
                        handleCloseViewModal(false)
                        setProduct({})
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

export default ProductView