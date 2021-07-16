import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, Tooltip, TextField, Grid, Button, Dialog, Accordion, AccordionDetails, AccordionSummary, Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ProductGroup_Autocomplete from '../ProductGroup/Control/ProductGroup.Autocomplete'
import UnitAdd_Autocomplete from '../../Config/Unit/Control/UnitAdd.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/Product.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import { useHotkeys } from 'react-hotkeys-hook'

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const ProductEdit = ({ id, productNameFocus, shouldOpenModal, handleCloseEditModal, handleEdit }) => {
    const { t } = useTranslation()

    const [product, setProduct] = useState({})
    const [isExpanded, setIsExpanded] = useState(false)

    useHotkeys('f3', () => handleEdit(product), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => handleCloseEditModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
        // if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        //     return
        // }
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
                o_17: newData.rows[0].o_18 // unit name
            }
            setProduct(newConvertData)
        }
    }

    const checkValidate = () => {
        if (product?.o_3?.trim().length > 0 && !!product?.o_2 && !!product?.o_5 && !!product?.o_1) {
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
        newProduct['o_2'] = !!obj ? obj?.o_1 : null
        setProduct(newProduct)
    }

    const handleSelectUnit = obj => {
        const newProduct = { ...product };
        newProduct['o_5'] = !!obj ? obj?.o_1 : null
        setProduct(newProduct)
    }

    return (

        < Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenModal}
            onClose={(e) => {
                handleCloseEditModal(false)
                setProduct({})
            }}
        >
            <Card>
                <CardHeader title={t('products.product.titleEdit', { name: product.o_3 })} />
                <CardContent>
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
                                onChange={handleChange}
                                value={product.o_3}
                                inputRef={productNameFocus}
                                name="o_3"
                                variant="outlined"
                                className="uppercaseInput"
                            />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <ProductGroup_Autocomplete
                                value={product.o_2}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.productGroup')}
                                onSelect={handleSelectProductGroup}
                            />
                        </Grid>

                        <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                            {/* <Unit_Autocomplete
                                value={product.o_17}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                            /> */}
                            <UnitAdd_Autocomplete
                                value={product.o_17}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                                onCreate={id => setProduct({ ...product, ...{ o_5: id } })}
                            />
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
                                    value={product.o_4}
                                    name="o_4"
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
                                value={product.o_15}
                                name="o_15"
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
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.designate')}
                                        onChange={handleChange}
                                        value={product.o_8}
                                        name="o_8"
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
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.dosage')}
                                        onChange={handleChange}
                                        value={product.o_9}
                                        name="o_9"
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
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.interact')}
                                        onChange={handleChange}
                                        value={product.o_10}
                                        name="o_10"
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
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('products.product.effect')}
                                        onChange={handleChange}
                                        value={product.o_12}
                                        name="o_12"
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
                                        value={product.o_13}
                                        name="o_13"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={(e) => {
                            handleCloseEditModal(false)
                            setProduct({})
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => handleEdit(product)}
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

export default ProductEdit