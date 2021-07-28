import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';
import {
    Card, CardHeader, CardContent, CardActions, Tooltip, TextField, Grid, Button, Dialog, Accordion, AccordionDetails, AccordionSummary, Typography, Chip
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import UnitAdd_Autocomplete from '../../Config/Unit/Control/UnitAdd.Autocomplete'
import ProductGroupAdd_Autocomplete from '../ProductGroup/Control/ProductGroupAdd.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import { productDefaulModal } from './Modal/Product.modal'

import AddIcon from '@material-ui/icons/Add';
import LoopIcon from '@material-ui/icons/Loop';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_ADD,
        biz: 'common',
        object: 'products'
    }
}

const ProductAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [product, setProduct] = useState(productDefaulModal)
    const [isExpanded, setIsExpanded] = useState(false)
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
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
    const step15Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => {
        setShouldOpenModal(false)
        setProduct(productDefaulModal)
    }, { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    const handleResultCreate = (reqInfoMap, message) => {
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
            setProduct(productDefaulModal)
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (step1Ref.current) step1Ref.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleCreate = () => {
        if (!product.name.trim() || !product.unit || !product.productGroup) return
        setProcess(true)
        const inputParam = [
            product.productGroup,
            !product.code || product.code.trim() === '' ? 'AUTO' : product.code.trim(),
            product.name,
            product.barcode,
            product.unit,
            product.content || '',
            product.contraind || '',
            product.designate || '',
            product.dosage || '',
            product.interact || '',
            product.manufact || '',
            product.effect || '',
            product.overdose || '',
            product.storages || '',
            product.packing || ''
        ];
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultCreate, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!product?.name?.trim() && !!product?.productGroup && !!product?.unit) {
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
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                // onClose={(e) => {
                //     setShouldOpenModal(false)
                //     setProduct(productDefaulModal)
                // }}
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
                                        inputRef={step1Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step2Ref.current.focus()
                                            }
                                        }}
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
                                    name="name"
                                    variant="outlined"
                                    className="uppercaseInput"
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                                <ProductGroupAdd_Autocomplete
                                    size={'small'}
                                    label={t('menu.productGroup')}
                                    onSelect={handleSelectProductGroup}
                                    onCreate={id => setProduct({ ...product, ...{ productGroup: id } })}
                                    inputRef={step3Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step4Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                                <UnitAdd_Autocomplete
                                    unitID={product.unit}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                    onCreate={id => setProduct({ ...product, ...{ unit: id } })}
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                        }
                                    }}
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
                                        value={product.barcode}
                                        name="barcode"
                                        variant="outlined"
                                        inputRef={step5Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step6Ref.current.focus()
                                            }
                                        }}
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
                                    inputRef={step6Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step7Ref.current.focus()
                                        }
                                    }}
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
                                    inputRef={step7Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step8Ref.current.focus()
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
                                            multiline
                                            autoComplete="off"
                                            label={t('products.product.contraind')}
                                            onChange={handleChange}
                                            value={product.contraind}
                                            name="contraind"
                                            variant="outlined"
                                            inputRef={step9Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step10Ref.current.focus()
                                                }
                                            }}
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
                                            multiline
                                            autoComplete="off"
                                            label={t('products.product.manufact')}
                                            onChange={handleChange}
                                            value={product.manufact}
                                            name="manufact"
                                            variant="outlined"
                                            inputRef={step11Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step12Ref.current.focus()
                                                }
                                            }}
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
                                            multiline
                                            autoComplete="off"
                                            label={t('products.product.storages')}
                                            onChange={handleChange}
                                            value={product.storages}
                                            name="storages"
                                            variant="outlined"
                                            inputRef={step13Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step14Ref.current.focus()
                                                }
                                            }}
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
                                            inputRef={step14Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step15Ref.current.focus()
                                                }
                                            }}
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
                                            inputRef={step15Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    handleCreate()
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
                            onClick={() => handleCreate()}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('btn.save')}
                        </Button>
                        <Button size='small'
                            onClick={() => {
                                saveContinue.current = true
                                handleCreate()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                            endIcon={process && <LoopIcon />}
                        >
                            {t('save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog >
        </>
    )
}

export default ProductAdd