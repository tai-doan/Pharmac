import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, CardActions, Tooltip, TextField, Grid, Button, Dialog, Accordion, AccordionDetails, AccordionSummary, Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ProductGroup_Autocomplete from '../ProductGroup/Control/ProductGroup.Autocomplete'
import UnitAdd_Autocomplete from '../../Config/Unit/Control/UnitAdd.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import SnackBarService from '../../../utils/service/snackbar_service'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import { config, productDefaulModal } from './Modal/Product.modal'
import { useHotkeys } from 'react-hotkeys-hook'

import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    GET_PRODUCT_BY_ID: {
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

const ProductEdit = ({ id, shouldOpenModal, setShouldOpenModal, onRefresh }) => {
    const { t } = useTranslation()

    const [product, setProduct] = useState({})
    const [isExpanded, setIsExpanded] = useState(false)
    const [process, setProcess] = useState(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)
    const step9Ref = useRef(null)
    const step10Ref = useRef(null)
    const step11Ref = useRef(null)
    const step12Ref = useRef(null)
    const step13Ref = useRef(null)
    const step14Ref = useRef(null)

    useHotkeys('f3', () => handleUpdate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => { setShouldOpenModal(false); setProduct(productDefaulModal) }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (shouldOpenModal && id && id !== 0) {
            sendRequest(serviceInfo.GET_PRODUCT_BY_ID, [id], handleResultGetProductByID, true, handleTimeOut)
        }
    }, [shouldOpenModal])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleResultGetProductByID = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
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
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        }
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setControlTimeOutKey(null)
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            setControlTimeOutKey(null)
            setProduct(productDefaulModal)
            setShouldOpenModal(false)
            onRefresh()
        }
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        let inputParam = Object.keys(product).map(key => product[key])
        inputParam.splice(-2); // xóa mã sp + tên units
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
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
        // onClose={(e) => {
        //     setShouldOpenModal(false)
        //     setProduct(productDefaulModal)
        // }}
        >
            <Card>
                <CardHeader title={t('products.product.titleEdit', { name: product.o_3 })} />
                <CardContent>
                    <Grid container spacing={1}>
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
                                required={true}
                                autoComplete="off"
                                margin="dense"
                                label={t('products.product.name')}
                                onChange={handleChange}
                                value={product.o_3}
                                name="o_3"
                                variant="outlined"
                                className="uppercaseInput"
                                inputRef={step1Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step2Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <ProductGroup_Autocomplete
                                value={product.o_2}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.productGroup')}
                                onSelect={handleSelectProductGroup}
                                inputRef={step2Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step3Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                            <UnitAdd_Autocomplete
                                value={product.o_17}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.configUnit')}
                                onSelect={handleSelectUnit}
                                onCreate={id => setProduct({ ...product, ...{ o_5: id } })}
                                inputRef={step3Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step4Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            handleUpdate()
                                        }
                                    }}
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                        }
                                    }}
                                />
                            </Tooltip>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('products.product.packing')}
                                onChange={handleChange}
                                value={product.o_15}
                                name="o_15"
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                                inputRef={step5Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        step6Ref.current.focus()
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} sm={6}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('products.product.content')}
                                onChange={handleChange}
                                value={product.o_6}
                                name="o_6"
                                variant="outlined"
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdate()
                                    }
                                }}
                                inputRef={step6Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        setIsExpanded(true)
                                        setTimeout(() => {
                                            step7Ref.current.focus()
                                        }, 10);
                                    }
                                }}
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
                            <Typography className=''>{t('product.infoExpand')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="pt-0 pb-0">
                            <Grid container className={''} spacing={1}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.designate')}
                                        onChange={handleChange}
                                        value={product.o_8}
                                        name="o_8"
                                        variant="outlined"
                                        inputRef={step7Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step8Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.contraind')}
                                        onChange={handleChange}
                                        value={product.o_7}
                                        name="o_7"
                                        variant="outlined"
                                        inputRef={step8Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step9Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.dosage')}
                                        onChange={handleChange}
                                        value={product.o_9}
                                        name="o_9"
                                        variant="outlined"
                                        inputRef={step9Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step10Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.manufact')}
                                        onChange={handleChange}
                                        value={product.o_11}
                                        name="o_11"
                                        variant="outlined"
                                        inputRef={step10Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step11Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.interact')}
                                        onChange={handleChange}
                                        value={product.o_10}
                                        name="o_10"
                                        variant="outlined"
                                        inputRef={step11Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step12Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.storages')}
                                        onChange={handleChange}
                                        value={product.o_14}
                                        name="o_14"
                                        variant="outlined"
                                        inputRef={step12Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step13Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.effect')}
                                        onChange={handleChange}
                                        value={product.o_12}
                                        name="o_12"
                                        variant="outlined"
                                        inputRef={step13Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step14Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('products.product.overdose')}
                                        onChange={handleChange}
                                        value={product.o_13}
                                        name="o_13"
                                        variant="outlined"
                                        inputRef={step14Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleUpdate()
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={(e) => {
                            if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                return
                            }
                            setShouldOpenModal(false)
                            setProduct(productDefaulModal)
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => handleUpdate()}
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

export default ProductEdit