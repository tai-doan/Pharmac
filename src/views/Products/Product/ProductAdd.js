import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';
import {
    Card, CardHeader, CardContent, CardActions, Tooltip, TextField, Grid, Button, Dialog, Accordion, AccordionDetails, AccordionSummary, Typography, Chip, Divider
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
import NumberFormat from 'react-number-format'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete';
import { modalDefaultAdd } from '../../Config/StoreLimit/Modal/StoreLimit.modal'
import { priceDefaultModal } from '../../Config/Price/Modal/Price.modal'
import moment from 'moment';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_ADD,
        biz: 'common',
        object: 'products'
    },
    CREATE_PRICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRICE_CREATE,
        biz: 'common',
        object: 'setup_price'
    },
    CREATE_UNIT_RATE: {
        functionName: 'insert',
        reqFunct: reqFunction.UNIT_RATE_CREATE,
        biz: 'common',
        object: 'units_cvt'
    },
    CREATE_STORE_LIMIT: {
        functionName: 'insert',
        reqFunct: reqFunction.STORE_LIMIT_CREATE,
        biz: 'common',
        object: 'store_limit'
    },
    CREATE_INVOICE_INVENTORY: {
        functionName: 'insert',
        reqFunct: reqFunction.IMPORT_INVENTORY_LIST,
        biz: 'import',
        object: 'imp_inventory'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
        biz: 'import',
        object: 'imp_inventory_dt'
    }
}

const ProductAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [product, setProduct] = useState(productDefaulModal)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isExpandedInfo, setIsExpandedInfo] = useState(false)
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const [requireExpDate, setRequireExpDate] = useState(false)
    const [invoiceInventory, setInvoiceInventory] = useState({ lot_no: '', exp_dt: null })
    const [unitRate, setUnitRate] = useState({ unit: null, rate: 0 })
    const [storeLimit, setStoreLimit] = useState(modalDefaultAdd)
    const [Price, setPrice] = useState(priceDefaultModal)

    const productIDCreated = useRef(null)
    const productCreated = useRef({})
    const productPriceCreated = useRef({})

    const prodCodeRef = useRef(null)
    const prodNameRef = useRef(null)
    const prodGroupRef = useRef(null)
    const prodUnitRef = useRef(null)
    const prodBarCodeRef = useRef(null)
    const packingRef = useRef(null)
    const contentRef = useRef(null)
    const designateRef = useRef(null)
    const contraindRef = useRef(null)
    const dosageRef = useRef(null)
    const manufactRef = useRef(null)
    const interactRef = useRef(null)
    const storagesRef = useRef(null)
    const effectRef = useRef(null)
    const overdoseRef = useRef(null)
    const rateParentRef = useRef(null)
    const rateRef = useRef(null)
    const storeCurrentRef = useRef(null)
    const LotNoRef = useRef(null)
    const ExpDateRef = useRef(null)
    const minQtyRef = useRef(null)
    const maxQtyRef = useRef(null)
    const impPriceRef = useRef(null)
    const impVATRef = useRef(null)
    const priceRef = useRef(null)
    const wholePriceRef = useRef(null)
    const expVATRef = useRef(null)

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
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (prodCodeRef.current) prodCodeRef.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            const newData = message['PROC_DATA']
            productCreated.current = product
            productIDCreated.current = newData?.rows
            handleCreateInvoiceInventory()
            handleCreatePrice()
            handleCreateUnitRate()
            handleCreateStoreLimit()
            setProduct(productDefaulModal)
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (prodCodeRef.current) prodCodeRef.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    const handleCreatePrice = () => {
        if (!productIDCreated.current || !productCreated.current.unit || Price.importVAT > 100 && Price.importVAT < 0 && Price.exportVAT > 100 &&
            Price.exportVAT < 0 && (Price.importPrice <= 0 || Price.price <= 0 || Price.wholePrice <= 0)) {
            return
        }
        productPriceCreated.current = Price
        const inputParam = [productIDCreated.current, productCreated.current.unit, Price.importPrice || 0, Price.importVAT || 0, Price.price || 0, Price.wholePrice || 0, Price.exportVAT || 0, ''];
        console.log('bắn event tạo bảng giá: ', inputParam)
        sendRequest(serviceInfo.CREATE_PRICE, inputParam, handleResultCreatePrice, true, handleTimeOut)
    }

    const handleResultCreatePrice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setPrice({ ...priceDefaultModal })
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // Xử lý thành công
        }
    }

    const handleCreateUnitRate = () => {
        if (!productIDCreated.current || !unitRate.unit || Number(unitRate.rate) <= 0) return
        const inputParam = [productIDCreated.current, unitRate.unit, Number(unitRate.rate) || 10]
        console.log('bắn event tạo chuyển đổi: ', inputParam)
        sendRequest(serviceInfo.CREATE_UNIT_RATE, inputParam, handleResultCreateUnitRate, true, handleTimeOut)
    }

    const handleResultCreateUnitRate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setUnitRate({ unit: null, rate: 0 })
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // Xử lý thành công
        }
    }

    const handleCreateStoreLimit = () => {
        if (!productIDCreated.current || !unitRate.unit || Number(unitRate.minQuantity) <= 0 || Number(unitRate.maxQuantity) <= 0 || Number(unitRate.minQuantity) > Number(unitRate.maxQuantity)) return
        const inputParam = [productIDCreated.current, productCreated.current.unit, Number(storeLimit.minQuantity) || 0, Number(storeLimit.maxQuantity) || 0]
        console.log('bắn event tạo kho: ', inputParam)
        sendRequest(serviceInfo.CREATE_STORE_LIMIT, inputParam, handleResultCreateStoreLimit, true, handleTimeOut)
    }

    const handleResultCreateStoreLimit = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setStoreLimit({ ...modalDefaultAdd })
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // Xử lý thành công
        }
    }

    const handleCreateInvoiceInventory = () => {
        if (!productIDCreated.current || productCreated.current.store_current <= 0 || !productCreated.current.unit) return
        console.log('bắn event tạo hđ tồn: ')
        sendRequest(serviceInfo.CREATE_INVOICE_INVENTORY, [], handleResultCreateInvoice, true, handleTimeOut)
    }

    const handleResultCreateInvoice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            const invoiceID = newData.rows[0].o_1
            if (!!invoiceID) {
                const inputParam = [
                    invoiceID,
                    productIDCreated.current,
                    invoiceInventory.lot_no,
                    productCreated?.current?.store_current,
                    productCreated?.current?.unit,
                    moment().format('YYYYMMDD'),
                    invoiceInventory.exp_dt ? moment(invoiceInventory.exp_dt).format('YYYYMMDD') : moment().format('YYYYMMDD'),
                    productPriceCreated?.current?.price
                ]
                console.log('bắn event thêm sp vô hđ tồn: ', inputParam)
                sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, handleResultAddProductToInvoice, true, handleTimeOut)
            }
        }
    }

    const handleResultAddProductToInvoice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        productPriceCreated.current = {}
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
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
            // Chưa chọn đơn vị và giá trị chuyển đổi
            if (unitRate.unit === null && unitRate.rate === 0) {
                // Chưa nhập thông tin tồn
                if (product.store_current === 0 && invoiceInventory.lot_no === '' && invoiceInventory.exp_dt === null) {
                    // Chưa nhập min - max
                    if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                        // Chưa nhập thông tin giá
                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                            return false
                        } else {
                            // Đã nhập đúng format thông tin giá
                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                return false
                            } else {
                                return true
                            }
                        }
                    } else {
                        // Đã nhập min/max của kho
                        if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                            // Chưa nhập thông tin giá
                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                return false
                            } else {
                                // Đã nhập đúng format thông tin giá
                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                    return false
                                } else {
                                    return true
                                }
                            }
                        } else {
                            // Chưa nhập thông tin giá
                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                // Đã nhập đúng format kho
                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                    return false
                                } else {
                                    return true
                                }
                            } else {
                                // Đã nhập đúng format thông tin giá
                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                    // Đã nhập đúng format kho
                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                        return false
                                    } else {
                                        return true
                                    }
                                } else {
                                    return true
                                }
                            }
                        }
                    }
                } else {
                    // Đã nhập đúng format thông tin hàng tồn
                    if (product.store_current > 0 && !!invoiceInventory.lot_no.trim()) {
                        // Bắt buộc nhập ngày hết hạn
                        if (requireExpDate) {
                            if (!!invoiceInventory.exp_dt) {
                                if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                                    // Chưa nhập thông tin giá
                                    if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                        return false
                                    } else {
                                        // Đã nhập đúng format thông tin giá
                                        if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    }
                                } else {
                                    // Đã nhập min/max của kho
                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            return false
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        }
                                    } else {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            // Đã nhập đúng format kho
                                            if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                // Đã nhập đúng format kho
                                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            } else {
                                                return true
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                                    // Chưa nhập thông tin giá
                                    if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                        return false
                                    } else {
                                        // Đã nhập đúng format thông tin giá
                                        if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    }
                                } else {
                                    // Đã nhập min/max của kho
                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            return false
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        }
                                    } else {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            // Đã nhập đúng format kho
                                            if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                // Đã nhập đúng format kho
                                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            } else {
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                                // Chưa nhập thông tin giá
                                if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                    return false
                                } else {
                                    // Đã nhập đúng format thông tin giá
                                    if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                        return false
                                    } else {
                                        return true
                                    }
                                }
                            } else {
                                // Đã nhập min/max của kho
                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                    // Chưa nhập thông tin giá
                                    if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                        return false
                                    } else {
                                        // Đã nhập đúng format thông tin giá
                                        if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    }
                                } else {
                                    // Chưa nhập thông tin giá
                                    if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                        // Đã nhập đúng format kho
                                        if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    } else {
                                        // Đã nhập đúng format thông tin giá
                                        if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                            // Đã nhập đúng format kho
                                            if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        } else {
                                            return true
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // Không nhập đúng format thông tin hàng tồn
                        return true
                    }
                }
            } else {
                // Đã nhập đủ đv chuyển đổi và giá trị chuyển đổi
                if (!!unitRate?.unit && unitRate?.rate > 0) {
                    // Chưa nhập thông tin tồn
                    if (product.store_current === 0 && invoiceInventory.lot_no === '' && invoiceInventory.exp_dt === null) {
                        // Chưa nhập min - max
                        if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                            // Chưa nhập thông tin giá
                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                return false
                            } else {
                                // Đã nhập đúng format thông tin giá
                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                    return false
                                } else {
                                    return true
                                }
                            }
                        } else {
                            // Đã nhập min/max của kho
                            if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                // Chưa nhập thông tin giá
                                if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                    return false
                                } else {
                                    // Đã nhập đúng format thông tin giá
                                    if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                        return false
                                    } else {
                                        return true
                                    }
                                }
                            } else {
                                // Chưa nhập thông tin giá
                                if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                    // Đã nhập đúng format kho
                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                        return false
                                    } else {
                                        return true
                                    }
                                } else {
                                    // Đã nhập đúng format thông tin giá
                                    if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                        // Đã nhập đúng format kho
                                        if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    } else {
                                        return true
                                    }
                                }
                            }
                        }
                    } else {
                        // Đã nhập đúng format thông tin hàng tồn
                        if (product.store_current > 0 && !!invoiceInventory.lot_no.trim()) {
                            if (requireExpDate) {
                                if (!!invoiceInventory.exp_dt) {
                                    // Chưa nhập min - max
                                    if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            return false
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        }
                                    } else {
                                        // Đã nhập min/max của kho
                                        if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                            // Chưa nhập thông tin giá
                                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                                return false
                                            } else {
                                                // Đã nhập đúng format thông tin giá
                                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            }
                                        } else {
                                            // Chưa nhập thông tin giá
                                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                                // Đã nhập đúng format kho
                                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            } else {
                                                // Đã nhập đúng format thông tin giá
                                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                    // Đã nhập đúng format kho
                                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                        return false
                                                    } else {
                                                        return true
                                                    }
                                                } else {
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    // Chưa nhập min - max
                                    if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            return false
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        }
                                    } else {
                                        // Đã nhập min/max của kho
                                        if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                            // Chưa nhập thông tin giá
                                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                                return false
                                            } else {
                                                // Đã nhập đúng format thông tin giá
                                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            }
                                        } else {
                                            // Chưa nhập thông tin giá
                                            if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                                // Đã nhập đúng format kho
                                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            } else {
                                                // Đã nhập đúng format thông tin giá
                                                if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                    // Đã nhập đúng format kho
                                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                        return false
                                                    } else {
                                                        return true
                                                    }
                                                } else {
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                // Chưa nhập min - max
                                if (storeLimit.minQuantity === 0 && storeLimit.maxQuantity === 0) {
                                    // Chưa nhập thông tin giá
                                    if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                        return false
                                    } else {
                                        // Đã nhập đúng format thông tin giá
                                        if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    }
                                } else {
                                    // Đã nhập min/max của kho
                                    if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            return false
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        }
                                    } else {
                                        // Chưa nhập thông tin giá
                                        if (Price.importPrice === 0 && Price.importVAT === 0 && Price.price === 0 && Price.wholePrice === 0 && Price.exportVAT === 0) {
                                            // Đã nhập đúng format kho
                                            if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                return false
                                            } else {
                                                return true
                                            }
                                        } else {
                                            // Đã nhập đúng format thông tin giá
                                            if (Price.importVAT <= 100 && Price.importVAT >= 0 && Price.exportVAT <= 100 && Price.exportVAT >= 0 && (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)) {
                                                // Đã nhập đúng format kho
                                                if ((storeLimit.minQuantity <= storeLimit.maxQuantity) && ((storeLimit.minQuantity > 0 && storeLimit.maxQuantity > -1) || (storeLimit.maxQuantity > 0 && storeLimit.minQuantity > -1))) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            } else {
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            // Chưa nhập đúng format thông tin hàng tồn
                            return true
                        }
                    }
                } else {
                    return true
                }
            }
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

    const handleChangeExpandInfo = () => {
        setIsExpandedInfo(e => !e)
    }

    const handleSelectProductGroup = obj => {
        const newProduct = { ...product };
        newProduct['productGroup'] = !!obj ? obj?.o_1 : null
        setRequireExpDate(!!obj ? glb_sv.defaultProductGroupId.includes(obj.o_1) : false)
        setProduct(newProduct)
    }

    const handleSelectUnit = obj => {
        const newProduct = { ...product };
        newProduct['unit'] = !!obj ? obj?.o_1 : null
        setProduct(newProduct)
    }

    const handleSelectUnitRate = obj => {
        const newUnitRate = { ...unitRate };
        newUnitRate['unit'] = !!obj ? obj?.o_1 : null
        setUnitRate(newUnitRate)
    }

    const handleChangeRate = e => {
        const newUnitRate = { ...unitRate };
        newUnitRate['rate'] = Number(e.value)
        setUnitRate(newUnitRate)
    }

    const handleMinQuantityChange = value => {
        const newStoreLimit = { ...storeLimit };
        newStoreLimit['minQuantity'] = Number(value.value) >= 0 ? Number(value.value) : 10
        setStoreLimit(newStoreLimit)
    }

    const handleMaxQuantityChange = value => {
        const newStoreLimit = { ...storeLimit };
        newStoreLimit['maxQuantity'] = Number(value.value) >= 0 ? Number(value.value) : 1000
        setStoreLimit(newStoreLimit)
    }

    const handleStoreCurrentChange = value => {
        const newProduct = { ...product }
        newProduct['store_current'] = Number(value.value) >= 0 ? Number(value.value) : 1000
        setProduct(newProduct)
    }

    const handleImportPriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['importPrice'] = Number(obj.value)
        setPrice(newPrice)
    }

    const handleImportVATChange = obj => {
        const newPrice = { ...Price };
        newPrice['importVAT'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }

    const handlePriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['price'] = Number(obj.value)
        setPrice(newPrice)
    }

    const handleWholePriceChange = obj => {
        const newPrice = { ...Price };
        newPrice['wholePrice'] = Number(obj.value)
        setPrice(newPrice)
    }

    const handleExportVATChange = obj => {
        const newPrice = { ...Price };
        newPrice['exportVAT'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }

    const handleInvoiceChange = e => {
        const newInvoice = { ...invoiceInventory }
        newInvoice[e.target.name] = e.target.value
        setInvoiceInventory(newInvoice)
    }

    const handleExpDateChange = date => {
        const newInvoice = { ...invoiceInventory }
        newInvoice['exp_dt'] = date;
        setInvoiceInventory(newInvoice)
    }

    return (
        <>
            <Chip size="small" className='mr-1' deleteIcon={<AddIcon />} onDelete={() => setShouldOpenModal(true)} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => setShouldOpenModal(true)} label={t('btn.add')} />
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
            >
                <Card className='product-card'>
                    <CardHeader title={t('products.product.titleAdd')} />
                    <CardContent>
                        <Grid container spacing={1}>
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
                                        inputRef={prodCodeRef}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                prodNameRef.current.focus()
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
                                    inputRef={prodNameRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            prodGroupRef.current.focus()
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
                                    inputRef={prodGroupRef}
                                    productGroupID={product.productGroup}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            prodUnitRef.current.focus()
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
                                    inputRef={prodUnitRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            prodBarCodeRef.current.focus()
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
                                        value={product.barcode}
                                        name="barcode"
                                        variant="outlined"
                                        inputRef={prodBarCodeRef}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                packingRef.current.focus()
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
                                    value={product.packing}
                                    name="packing"
                                    variant="outlined"
                                    inputRef={packingRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            contentRef.current.focus()
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
                                    value={product.content}
                                    name="content"
                                    variant="outlined"
                                    inputRef={contentRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            setIsExpanded(true)
                                            setTimeout(() => {
                                                designateRef.current.focus()
                                            }, 10);
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Accordion className='mb-2' expanded={isExpanded} onChange={handleChangeExpand}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1bh-content"
                                id="panel1bh-header"
                                height="50px"
                            >
                                <Typography className=''>{t('product.infoExpand')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails className="pt-0 pb-1">
                                <Grid container className='' spacing={1}>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin="dense"
                                            autoComplete="off"
                                            label={t('products.product.designate')}
                                            onChange={handleChange}
                                            value={product.designate}
                                            name="designate"
                                            variant="outlined"
                                            inputRef={designateRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    contraindRef.current.focus()
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
                                            value={product.contraind}
                                            name="contraind"
                                            variant="outlined"
                                            inputRef={contraindRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    dosageRef.current.focus()
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
                                            value={product.dosage}
                                            name="dosage"
                                            variant="outlined"
                                            inputRef={dosageRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    manufactRef.current.focus()
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
                                            value={product.manufact}
                                            name="manufact"
                                            variant="outlined"
                                            inputRef={manufactRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    interactRef.current.focus()
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
                                            value={product.interact}
                                            name="interact"
                                            variant="outlined"
                                            inputRef={interactRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    storagesRef.current.focus()
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
                                            value={product.storages}
                                            name="storages"
                                            variant="outlined"
                                            inputRef={storagesRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    effectRef.current.focus()
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
                                            value={product.effect}
                                            name="effect"
                                            variant="outlined"
                                            inputRef={effectRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    overdoseRef.current.focus()
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
                                            value={product.overdose}
                                            name="overdose"
                                            variant="outlined"
                                            inputRef={overdoseRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    storeCurrentRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={isExpandedInfo} onChange={handleChangeExpandInfo}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1bh-content"
                                id="panel1bh-header"
                                height="50px"
                            >
                                <Typography className=''>{t('product.orderInfoExpand')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails className="pt-0">
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={product.store_current}
                                            label={t('product.store_current')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleStoreCurrentChange}
                                            onFocus={e => e.target.select()}
                                            inputRef={storeCurrentRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    LotNoRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <Unit_Autocomplete
                                            disabled={true}
                                            unitID={product.unit || null}
                                            style={{ marginTop: 8, marginBottom: 4 }}
                                            size={'small'}
                                            label={t('min_unit')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <TextField
                                            fullWidth={true}
                                            margin="dense"
                                            required
                                            autoComplete="off"
                                            label={t('order.import.lot_no')}
                                            onChange={handleInvoiceChange}
                                            value={invoiceInventory.lot_no || ''}
                                            name='lot_no'
                                            variant="outlined"
                                            inputRef={LotNoRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    ExpDateRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                required={requireExpDate}
                                                disableToolbar
                                                margin="dense"
                                                variant="outlined"
                                                style={{ width: '100%' }}
                                                inputVariant="outlined"
                                                format="dd/MM/yyyy"
                                                id="exp_dt-picker-inline"
                                                label={t('order.import.exp_dt')}
                                                value={invoiceInventory.exp_dt}
                                                onChange={handleExpDateChange}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change date',
                                                }}
                                                inputRef={ExpDateRef}
                                                onKeyPress={event => {
                                                    if (event.key === 'Enter') {
                                                        minQtyRef.current.focus()
                                                    }
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </Grid>

                                    <Grid item xs={12} sm={3} md={3}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={storeLimit.minQuantity}
                                            label={t('config.store_limit.minQuantity')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleMinQuantityChange}
                                            onFocus={e => e.target.select()}
                                            inputRef={minQtyRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    maxQtyRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={storeLimit.maxQuantity}
                                            label={t('config.store_limit.maxQuantity')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleMaxQuantityChange}
                                            onFocus={e => e.target.select()}
                                            inputRef={maxQtyRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    impPriceRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={4} md={4}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={Price.importPrice || 0}
                                            label={t('config.price.importPrice')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleImportPriceChange}
                                            inputRef={impPriceRef}
                                            onFocus={e => e.target.select()}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    impVATRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={Price.importVAT || 0}
                                            label={t('config.price.importVAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            suffix="%"
                                            thousandSeparator={true}
                                            onValueChange={handleImportVATChange}
                                            inputRef={impVATRef}
                                            onFocus={e => e.target.select()}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    priceRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5} md={5}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={Price.price || 0}
                                            label={t('config.price.price')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handlePriceChange}
                                            inputRef={priceRef}
                                            onFocus={e => e.target.select()}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    wholePriceRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5} md={5}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={Price.wholePrice || 0}
                                            label={t('config.price.wholePrice')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleWholePriceChange}
                                            inputRef={wholePriceRef}
                                            onFocus={e => e.target.select()}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    expVATRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={Price.exportVAT || 0}
                                            label={t('config.price.exportVAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            suffix="%"
                                            thousandSeparator={true}
                                            onValueChange={handleExportVATChange}
                                            inputRef={expVATRef}
                                            onFocus={e => e.target.select()}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    rateParentRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Divider orientation="horizontal" />
                                    <Grid item xs={12} sm={4} md={4}>
                                        <Unit_Autocomplete
                                            unitID={unitRate.unit || null}
                                            style={{ marginTop: 8, marginBottom: 4 }}
                                            size={'small'}
                                            label={t('config.unitRate.unitParent')}
                                            onSelect={handleSelectUnitRate}
                                            inputRef={rateParentRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    rateRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <NumberFormat className='inputNumber'
                                            style={{ width: '100%' }}
                                            required
                                            value={unitRate.rate || 0}
                                            label={t('config.unitRate.rate')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleChangeRate}
                                            onFocus={e => e.target.select()}
                                            inputRef={rateRef}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    handleCreate()
                                                }
                                            }}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <Unit_Autocomplete
                                            disabled={true}
                                            unitID={product.unit || null}
                                            style={{ marginTop: 8, marginBottom: 4 }}
                                            size={'small'}
                                            label={t('min_unit')}
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