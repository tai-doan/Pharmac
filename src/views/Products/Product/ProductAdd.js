import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import NumberFormat from 'react-number-format'

import ProductGroup_Autocomplete from '../ProductGroup/Control/ProductGroup.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import UnitAdd_Autocomplete from '../../Config/Unit/Control/UnitAdd.Autocomplete'
import ProductGroupAdd_Autocomplete from '../ProductGroup/Control/ProductGroupAdd.Autocomplete'
import Product_Autocomplete from './Control/Product.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/Product.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import { Card, CardHeader, CardContent, CardActions } from '@material-ui/core'

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

const ProductAdd = ({ id, productData, productNameFocus, shouldOpenModal, handleCloseAddModal, handleCreate }) => {
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

    useEffect(() => {
        setProduct({ ...productData })
    }, [productData])

    const resultGetProductByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setProduct(newData.rows)
        }
    }

    const checkValidate = () => {
        if (product?.name?.trim().length > 0 && !!product?.productGroup && !!product?.unit) {
            return false
        }
        return true
    }

    const handleChange = e => {
        const newProduct = { ...product };
        newProduct[e.target.name] = e.target.value;
        setProduct(newProduct)
    }

    const handleChangeExpand = () => {
        setIsExpanded(e => !e)
    }

    const handleSelectProductGroup = obj => {
        const newProduct = { ...product };
        newProduct['productGroup'] = !!obj ? obj?.o_1 : null
        setProduct(newProduct)
    }

    const handleSelectUnit = obj => {
        const newProduct = { ...product };
        newProduct['unit'] = !!obj ? obj?.o_1 : null
        setProduct(newProduct)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            onClose={(e) => {
                handleCloseAddModal(false)
                setProduct({})
            }}
        >
            <Card>
                <CardHeader title={t('products.product.titleAdd')} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Tooltip placement="top" title={t('product.tooltip.productCode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('products.product.code')}
                                    onChange={handleChange}
                                    value={product.code}
                                    name="code"
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
                                onChange={handleChange}
                                value={product.name}
                                inputRef={productNameFocus}
                                name="name"
                                variant="outlined"
                                className="uppercaseInput"
                            />
                        </Grid>

                        <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                            {/* <ProductGroupAdd_Autocomplete
                                size={'small'}
                                label={t('menu.productGroup')}
                                onSelect={handleSelectProductGroup}
                                onCreate={id => setProduct({ ...product, ...{ productGroup: id } })}
                            /> */}
                            <ProductGroup_Autocomplete
                                value={product.o_2}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                size={'small'}
                                label={t('menu.productGroup')}
                                onSelect={handleSelectProductGroup}
                            />
                        </Grid>

                        <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                            <UnitAdd_Autocomplete
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                                onCreate={id => setProduct({ ...product, ...{ unit: id } })}
                            />
                            {/* <Unit_Autocomplete
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                            /> */}
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Tooltip placement="top" title={t('product.tooltip.barcode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('products.product.barcode')}
                                    onChange={handleChange}
                                    value={product.barcode}
                                    name="barcode"
                                    variant="outlined"
                                />
                            </Tooltip>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('products.product.packing')}
                                onChange={handleChange}
                                value={product.packing}
                                name="packing"
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={6} sm={6}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('products.product.content')}
                                onChange={handleChange}
                                value={product.content}
                                name="content"
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
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.designate')}
                                        onChange={handleChange}
                                        value={product.designate}
                                        name="designate"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.contraind')}
                                        onChange={handleChange}
                                        value={product.contraind}
                                        name="contraind"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                        <AccordionDetails className="pt-0 pb-0">
                            <Grid container className="{}" spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.dosage')}
                                        onChange={handleChange}
                                        value={product.dosage}
                                        name="dosage"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.manufact')}
                                        onChange={handleChange}
                                        value={product.manufact}
                                        name="manufact"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                        <AccordionDetails className="pt-0 pb-0">
                            <Grid container className={''} spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.interact')}
                                        onChange={handleChange}
                                        value={product.interact}
                                        name="interact"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.storages')}
                                        onChange={handleChange}
                                        value={product.storages}
                                        name="storages"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                        <AccordionDetails className="pt-0">
                            <Grid container className="{}" spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.effect')}
                                        onChange={handleChange}
                                        value={product.effect}
                                        name="effect"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.overdose')}
                                        onChange={handleChange}
                                        value={product.overdose}
                                        name="overdose"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button
                        onClick={(e) => {
                            handleCloseAddModal(false)
                            setProduct({})
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button
                        onClick={() => handleCreate(false, product)}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    <Button
                        onClick={() => handleCreate(true, product)}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('save_continue')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default ProductAdd