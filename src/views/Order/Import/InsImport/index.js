import React, { useState, useRef, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Grid, Tooltip, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Button, Divider, CardActions,
    TextField, Card, CardHeader, CardContent, FormControl, MenuItem, InputLabel, Select, Dialog, Link as LinkMT
} from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import NumberFormat from 'react-number-format'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import LoopIcon from '@material-ui/icons/Loop';

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import SnackBarService from '../../../../utils/service/snackbar_service'
import { requestInfo } from '../../../../utils/models/requestInfo'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'

import { tableListAddColumn, invoiceImportModal, productImportModal } from '../Modal/Import.modal'
import moment from 'moment'
// import AddProduct from '../AddProduct'

import { Link } from 'react-router-dom'
import EditProductRows from '../EditImport/EditProductRows'
import SupplierAdd_Autocomplete from '../../../Partner/Supplier/Control/SupplierAdd.Autocomplete'
import { useHotkeys } from 'react-hotkeys-hook'
import Dictionary from '../../../../components/Dictionary';
import AddProduct from '../AddProductClone'
import { useReactToPrint } from 'react-to-print';
import Import_Bill from '../../../../components/Bill/Import_Bill'
import ExportExcel from '../../../../components/ExportExcel'

const serviceInfo = {
    CREATE_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.IMPORT_CREATE,
        biz: 'import',
        object: 'imp_invoices'
    },
    UPDATE_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.IMPORT_UPDATE,
        biz: 'import',
        object: 'imp_invoices'
    },
    GET_INVOICE_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.IMPORT_BY_ID,
        biz: 'import',
        object: 'imp_invoices'
    },
    GET_ALL_PRODUCT_BY_INVOICE_ID: {
        functionName: 'get_all',
        reqFunct: reqFunction.GET_ALL_PRODUCT_BY_INVOICE_ID,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    DELETE_PRODUCT_TO_INVOICE: {
        functionName: 'delete',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_DELETE,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    CREATE_SETTLEMENT: {
        functionName: 'insert',
        reqFunct: reqFunction.SETTLEMENT_IMPORT_CREATE,
        biz: 'settlement',
        object: 'imp_settl'
    },
    GET_SETTLEMENT_BY_INVOICE_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.SETTLEMENT_IMPORT_BY_INVOICE_ID,
        biz: 'settlement',
        object: 'imp_settl'
    },
}

const ProductImport = () => {
    const { t } = useTranslation()
    const [Import, setImport] = useState({ ...invoiceImportModal })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [dataSource, setDataSource] = useState([])
    const [productDeleteModal, setProductDeleteModal] = useState({})
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListAddColumn])
    const [shouldOpenPaymentModal, setShouldOpenPaymentModal] = useState(false)
    const [productDeleteIndex, setProductDeleteIndex] = useState(null)
    const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false)
    const [paymentInfo, setPaymentInfo] = useState({})
    const [invoiceFlag, setInvoiceFlag] = useState(false)
    const [resetFormAddFlag, setResetFormAddFlag] = useState(false)
    const [deleteProcess, setDeleteProcess] = useState(false)
    const [updateProcess, setUpdateProcess] = useState(false)

    const componentPrint = useRef(null)
    const dataWaitAdd = useRef([])
    const newInvoiceId = useRef(-1)
    const dataSourceRef = useRef([])
    const importDataRef = useRef(invoiceImportModal)
    const totalProductCountAdded = useRef(0)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    // useHotkeys('f6', () => handleCreateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const newData = { ...paymentInfo }
        newData['invoice_val'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.o_10 * obj.o_13)
        }, 0) || 0
        newData['invoice_discount'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.o_15 / 100 * newData.invoice_val)
        }, 0) || 0
        newData['invoice_vat'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.o_14 / 100 * Math.round(newData.invoice_val * (1 - (obj.o_15 / 100))))
        }, 0) || 0
        newData['invoice_needpay'] = newData.invoice_val - newData.invoice_discount + newData.invoice_vat || 0
        setPaymentInfo(newData)
        setImport(prevState => { return { ...prevState, ...{ payment_amount: newData.invoice_needpay } } })
    }, [dataSource])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setDeleteProcess(false)
        setUpdateProcess(false)
    }

    const resultCreateSettlement = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        console.log('create settlement result: ', reqInfoMap, message)
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        dataSourceRef.current = [];
        totalProductCountAdded.current = 0;
        importDataRef.current = invoiceImportModal
        setImport({ ...invoiceImportModal })
        setDataSource([])
        setSupplierSelect('')
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
        }
    }

    const createSettlement = invoiceNo => {
        const inputParams = [
            '10',
            invoiceNo || newInvoiceId.current,
            importDataRef.current.payment_type,
            moment(importDataRef.current.order_dt).format('YYYYMMDD'),
            importDataRef.current.payment_amount > paymentInfo.invoice_needpay ? paymentInfo.invoice_needpay : importDataRef.current.payment_amount,
            importDataRef.current.bank_transf_acc_number,
            importDataRef.current.bank_transf_acc_name,
            importDataRef.current.bank_transf_name || '',
            importDataRef.current.bank_recei_acc_number,
            importDataRef.current.bank_recei_acc_name,
            importDataRef.current.bank_recei_name || '',
            importDataRef.current.note
        ]
        sendRequest(serviceInfo.CREATE_SETTLEMENT, inputParams, null, true, handleTimeOut)
    }

    const handleSelectSupplier = obj => {
        const newImport = { ...Import };
        newImport['supplier'] = !!obj ? obj?.o_1 : null
        importDataRef.current = newImport
        setSupplierSelect(!!obj ? obj?.o_2 : '')
        setImport(newImport)
    }

    const handleCreateSupplier = id => {
        const newImport = { ...Import };
        newImport['supplier'] = id
        importDataRef.current = newImport
        setImport(newImport)
    }

    const handleDateChange = date => {
        const newImport = { ...Import };
        newImport['order_dt'] = date;
        importDataRef.current = newImport
        setImport(newImport)
    }

    const handleChange = e => {
        const newImport = { ...Import };
        newImport[e.target.name] = e.target.value
        if (e.target.name === 'payment_type' && e.target.value === '1') {
            newImport['bank_transf_name'] = null
            newImport['bank_transf_acc_name'] = ''
            newImport['bank_transf_acc_number'] = ''
            newImport['bank_recei_name'] = null
            newImport['bank_recei_acc_number'] = ''
            newImport['bank_recei_acc_number'] = ''
            importDataRef.current = newImport
            setImport(newImport)
        } else {
            importDataRef.current = newImport
            setImport(newImport)
        }
    }

    const handleAmountChange = value => {
        const newImport = { ...Import };
        newImport['payment_amount'] = Number(value.value)
        importDataRef.current = newImport
        setImport(newImport)
    }

    const handleSelectTransfBank = obj => {
        const newImport = { ...Import };
        newImport['bank_transf_name'] = !!obj ? obj?.o_1 : null
        newImport['bank_transf_name_s'] = !!obj ? obj?.o_2 : null
        importDataRef.current = newImport
        setImport(newImport)
    }

    const handleSelectReceiBank = obj => {
        const newImport = { ...Import };
        newImport['bank_recei_name'] = !!obj ? obj?.o_1 : null
        newImport['bank_recei_name_s'] = !!obj ? obj?.o_2 : null
        importDataRef.current = newImport
        setImport(newImport)
    }

    const handleAddProduct = productObject => {
        if (!Import.supplier || !Import.order_dt) {
            SnackBarService.alert(t('message.requireImportInvoice'), true, 4, 3000)
            return
        } else if (!invoiceFlag) {
            dataWaitAdd.current.push(productObject)
            handleCreateInvoice()
            return
        } else {
            const inputParam = [
                newInvoiceId.current,
                productObject.imp_tp,
                productObject.prod_id,
                productObject.lot_no,
                productObject.made_dt,
                moment(productObject.exp_dt).format('YYYYMMDD'),
                productObject.qty,
                productObject.unit_id,
                productObject.price,
                productObject.discount_per,
                productObject.vat_per
            ]
            sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, handleResultAddProductToInvoice, true, handleTimeOut)
        }
    }

    const onRemove = item => {
        setProductDeleteModal(!!item ? item : {})
        setShouldOpenDeleteModal(!!item ? true : false)
    }

    const handleDelete = () => {
        if (!productDeleteModal.o_1 || !productDeleteModal.o_2) return
        const inputParam = [productDeleteModal.o_2, productDeleteModal.o_1];
        sendRequest(serviceInfo.DELETE_PRODUCT_TO_INVOICE, inputParam, handleResultDeleteProduct, true, handleTimeOut)
    }

    const handleResultDeleteProduct = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setDeleteProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            setProductDeleteIndex(null)
            setProductDeleteModal({})
            setShouldOpenDeleteModal(false)
        }
    }

    const checkValidate = () => {
        if (invoiceFlag && !!Import.supplier && !!Import.order_dt) {
            return false
        }
        return true
    }

    const handleCreateInvoice = () => {
        if (!Import.supplier || !Import.order_dt) {
            SnackBarService.alert(t('message.supplierRequire'), true, 4, 3000)
            return
        }
        if (!Import.payment_type || Import.payment_amount < 0) return
        if (Import.payment_type === '2' &&
            (!Import.bank_transf_acc_name || !Import.bank_transf_acc_number || !Import.bank_transf_name
                || !Import.bank_recei_acc_name || !Import.bank_recei_acc_number || !Import.bank_recei_name)) return
        //bắn event tạo invoice
        const inputParam = [
            !!Import.invoice_no ? Import.invoice_no : 'AUTO',
            Import.supplier,
            moment(Import.order_dt).format('YYYYMMDD'),
            Import.person_s,
            Import.person_r,
            Import.note
        ];
        sendRequest(serviceInfo.CREATE_INVOICE, inputParam, handleResultCreateInvoice, true, handleTimeOut)
    }

    const handleUpdateInvoice = () => {
        if (!Import.invoice_id && !invoiceFlag) {
            handleCreateInvoice()
            // SnackBarService.alert(t('can_not_found_id_invoice_please_try_again'), true, 'error', 3000)
            return
        } else if (!Import.supplier || !Import.order_dt) {
            SnackBarService.alert(t('message.requireImportInvoice'), true, 'error', 3000)
            return
        }
        setUpdateProcess(true)
        //bắn event update invoice
        const inputParam = [
            Import.invoice_id,
            Import.supplier,
            moment(Import.order_dt).format('YYYYMMDD'),
            Import.person_s,
            Import.person_r,
            Import.note
        ];
        sendRequest(serviceInfo.UPDATE_INVOICE, inputParam, handleResultUpdateInvoice, true, handleTimeOut)

        // bắn event update tiền hđ thanh toán (settlement)
        sendRequest(serviceInfo.GET_SETTLEMENT_BY_INVOICE_ID, [Import.invoice_id], handleResultGetSettlementByInvoiceID, true, handleTimeOut)
    }

    const handleResultGetSettlementByInvoiceID = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            console.log('handleResultGetSettlementByInvoiceID: ', reqInfoMap, message)
            let newData = message['PROC_DATA']
            if (newData.rowTotal === 0) {
                // chưa có bút toán nào => tạo bút toán cho nó

            }
        }
    }

    const handleResultUpdateInvoice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setUpdateProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
        }
    }

    const handleResultCreateInvoice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            if (!!newData.rows[0].o_1) {
                newInvoiceId.current = newData.rows[0].o_1
                setInvoiceFlag(true)
                sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
                if (dataWaitAdd.current.length > 0) {
                    for (let i = 0; i < dataWaitAdd.current.length; i++) {
                        const item = dataWaitAdd.current[i];
                        const inputParam = [
                            newData.rows[0].o_1 || newInvoiceId.current,
                            item.imp_tp,
                            item.prod_id,
                            item.lot_no,
                            item.made_dt,
                            moment(item.exp_dt).format('YYYYMMDD'),
                            item.qty,
                            item.unit_id,
                            item.price,
                            item.discount_per,
                            item.vat_per
                        ]
                        sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, handleResultAddProductToInvoice, true, handleTimeOut)
                    }
                }
            }
        }
    }

    const handleResultAddProductToInvoice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            dataWaitAdd.current = []
            setResetFormAddFlag(true)
            setTimeout(() => {
                setResetFormAddFlag(false)
            }, 1000);
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [newInvoiceId.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
        }
    }

    const handleResultGetInvoiceByID = (reqInfoMap, message) => {
        // SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let dataImport = {
                invoice_id: newData.rows[0].o_1,
                invoice_no: newData.rows[0].o_2,
                invoice_stat: newData.rows[0].o_3,
                supplier: newData.rows[0].o_4,
                supplier_nm: newData.rows[0].o_5,
                order_dt: moment(newData.rows[0].o_6, 'YYYYMMDD').toString(),
                person_s: newData.rows[0].o_8,
                person_r: newData.rows[0].o_9,
                cancel_reason: newData.rows[0].o_10,
                note: newData.rows[0].o_11,
                invoice_val: newData.rows[0].o_13,
                invoice_discount: newData.rows[0].o_14,
                invoice_vat: newData.rows[0].o_15,
                invoice_settl: newData.rows[0].o_16,
            }
            setImport(dataImport)
            setSupplierSelect(newData.rows[0].o_5)
        }
    }

    const handleGetAllProductByInvoiceID = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setDataSource(newData.rows)
        }
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
        sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [newInvoiceId.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
    }

    const changePaymentType = () => {
        const newData = { ...Import }
        if (Import.payment_type === '1') {
            newData['payment_type'] = '2'
            newData['bank_transf_name'] = null
            newData['bank_transf_acc_name'] = ''
            newData['bank_transf_acc_number'] = ''
            newData['bank_recei_name'] = null
            newData['bank_recei_acc_number'] = ''
            newData['bank_recei_acc_number'] = ''
            setImport(newData)
            setShouldOpenPaymentModal(true)
        } else {
            newData['payment_type'] = '1'
            setImport(newData)
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('order.import.prod_nm'), key: 'prod_nm' },
        { label: t('order.import.imp_tp_nm'), key: 'imp_tp_nm' },
        { label: t('order.import.lot_no'), key: 'lot_no' },
        { label: t('order.import.exp_dt'), key: 'exp_dt' },
        { label: t('order.import.qty'), key: 'qty' },
        { label: t('order.import.unit_nm'), key: 'unit_nm' },
        { label: t('order.import.price'), key: 'price' },
        { label: t('order.import.discount_per'), key: 'discount_per' },
        { label: t('order.import.vat_per'), key: 'vat_per' },
        { label: t(''), key: 'space_01' },
        { label: t('order.import.invoice_no'), key: 'invoice_no' },
        { label: t('order.import.vender_nm'), key: 'supplier_nm' },
        { label: t('order.import.order_dt'), key: 'order_dt' },
        { label: t('order.import.note'), key: 'note' },
        { label: t('order.import.invoice_val'), key: 'invoice_val' },
        { label: t('order.import.invoice_discount'), key: 'invoice_discount' },
        { label: t('order.import.invoice_vat'), key: 'invoice_vat' }
    ]

    const dataCSV = () => {
        let result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['imp_tp_nm'] = data.o_4
            item['prod_nm'] = data.o_6
            item['lot_no'] = data.o_7
            item['exp_dt'] = data.o_9 ? moment(data.o_9, 'YYYYMMDD').format('DD/MM/YYYY') : ''
            item['qty'] = data.o_10
            item['unit_nm'] = data.o_12
            item['price'] = data.o_13
            item['discount_per'] = data.o_14
            item['vat_per'] = data.o_15

            item['space_01'] = ''
            item['invoice_no'] = ''
            item['supplier_nm'] = ''
            item['order_dt'] = ''
            item['invoice_val'] = ''
            item['invoice_discount'] = ''
            item['invoice_vat'] = ''
            item['note'] = ''
            return item
        })

        if (result.length > 0) {
            result[0].space_01 = ''
            result[0].invoice_no = Import.invoice_no
            result[0].supplier_nm = Import.supplier_nm
            result[0].order_dt = Import.order_dt ? moment(Import.order_dt).format('DD/MM/YYYY') : ''
            result[0].invoice_val = Import.invoice_val
            result[0].invoice_discount = Import.invoice_discount
            result[0].invoice_vat = Import.invoice_vat
            result[0].note = Import.note
        }
        return result
    }

    const handlePrint = useReactToPrint({
        content: () => componentPrint.current,
    });

    return (
        <Grid container spacing={1}>
            <EditProductRows productEditID={productEditID} invoiceID={newInvoiceId.current} onRefresh={handleRefresh} setProductEditID={setProductEditID} />
            <Grid item md={9} xs={12}>
                <AddProduct resetFlag={resetFormAddFlag} onAddProduct={handleAddProduct} />
                <Card>
                    <CardHeader
                        title={t('order.import.productImportList')}
                        action={<ExportExcel filename={`import_${Import.invoice_no}`} data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />}
                    />
                    <CardContent>
                        <TableContainer className="tableContainer tableOrder">
                            <Table stickyHeader>
                                <caption
                                    className={['text-center text-danger border-bottom', dataSource.length > 0 ? 'd-none' : ''].join(
                                        ' '
                                    )}
                                >
                                    {t('lbl.emptyData')}
                                </caption>
                                <TableHead>
                                    <TableRow>
                                        {column.map(col => (
                                            <TableCell nowrap="true" align={col.align}
                                                className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                                key={col.field}
                                            >
                                                {t(col.title)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataSource.map((item, index) => {
                                        return (
                                            <TableRow onDoubleClick={e => {
                                                setProductEditID(item.o_1)
                                            }} hover role="checkbox" tabIndex={-1} key={index}>
                                                {column.map((col, indexRow) => {
                                                    let value = item[col.field]
                                                    if (col.show) {
                                                        switch (col.field) {
                                                            case 'action':
                                                                return (
                                                                    <TableCell nowrap="true" nowrap="true" key={indexRow} align={col.align}>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                onRemove(item)
                                                                                setProductDeleteIndex(index + 1)
                                                                            }}
                                                                        >
                                                                            <DeleteIcon style={{ color: 'red' }} fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                setProductEditID(item.o_1)
                                                                            }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                )
                                                            case 'stt':
                                                                return (
                                                                    <TableCell nowrap="true" nowrap="true" key={indexRow} align={col.align}>
                                                                        {index + 1}
                                                                    </TableCell>
                                                                )
                                                            case 'imp_tp':
                                                                return (
                                                                    <TableCell nowrap="true" nowrap="true" key={indexRow} align={col.align}>
                                                                        {value === '1' ? t('order.import.import_type_buy') : t('order.import.import_type_selloff')}
                                                                    </TableCell>
                                                                )
                                                            default:
                                                                return (
                                                                    <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                        {glb_sv.formatValue(value, col['type'])}
                                                                    </TableCell>
                                                                )
                                                        }
                                                    }
                                                })}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={3} xs={12}>
                <Card>
                    <CardHeader title={t('order.import.invoice_info')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Tooltip placement="top" title={t('auto_invoice')} arrow>
                                <TextField
                                    fullWidth={true}
                                    disabled={invoiceFlag}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('auto_invoice')}
                                    className="uppercaseInput"
                                    onChange={handleChange}
                                    value={Import.invoice_no || ''}
                                    name='invoice_no'
                                    variant="outlined"
                                />
                            </Tooltip>
                            <div className='d-flex align-items-center w-100'>
                                <SupplierAdd_Autocomplete
                                    autoFocus={true}
                                    value={supplierSelect || ''}
                                    size={'small'}
                                    label={t('menu.supplier')}
                                    onSelect={handleSelectSupplier}
                                    onCreate={handleCreateSupplier}
                                    inputRef={step1Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step2Ref.current.focus()
                                        }
                                    }}
                                />
                            </div>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    margin="dense"
                                    variant="outlined"
                                    style={{ width: '100%' }}
                                    inputVariant="outlined"
                                    format="dd/MM/yyyy"
                                    id="order_dt-picker-inline"
                                    label={t('order.import.order_dt')}
                                    value={Import.order_dt}
                                    onChange={handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                rows={2}
                                rowsMax={5}
                                label={t('order.import.note')}
                                onChange={handleChange}
                                value={Import.note || ''}
                                name='note'
                                variant="outlined"
                                inputRef={step3Ref}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        handleUpdateInvoice()
                                    }
                                }}
                            />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                value={Import.invoice_val || 0}
                                label={t('order.import.invoice_val')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                value={Import.invoice_discount || 0}
                                label={t('order.import.invoice_discount')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                value={Import.invoice_vat || 0}
                                label={t('order.import.invoice_vat')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <Divider orientation="horizontal" />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                value={paymentInfo.invoice_needpay}
                                label={t('order.import.invoice_needpay')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={Import.payment_amount}
                                label={t('settlement.payment_amount')}
                                onValueChange={handleAmountChange}
                                name='payment_amount'
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                            />
                            <Divider orientation="horizontal" flexItem />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                value={Import.payment_amount - paymentInfo.invoice_needpay > 0 ? Import.payment_amount - paymentInfo.invoice_needpay : 0}
                                label={t('settlement.excess_cash')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            {/* <LinkMT href="#" onClick={changePaymentType} variant="body2" color='error'>
                                {Import.payment_type === '1' ? t('settlement.payment_transfer') : t('settlement.payment_cash')}
                            </LinkMT> */}
                        </Grid>
                        <Grid container spacing={1} className='mt-2'>
                            <Button
                                style={{ width: 'calc(60% - 0.25rem)', marginRight: '0.5rem' }}
                                size='small'
                                onClick={() => {
                                    handleUpdateInvoice();
                                }}
                                variant="contained"
                                disabled={checkValidate()}
                                className={checkValidate() === false ? 'bg-success text-white' : ''}
                            >
                                {t('btn.payment')}
                            </Button>
                            <Button
                                onClick={handlePrint}
                                disabled={!invoiceFlag}
                                className={invoiceFlag ? 'bg-print text-white' : ''}
                                id='buttonPrint'
                                size='smail'
                                variant="contained"
                                style={{ width: 'calc(40% - 0.25rem)' }}
                            >
                                {t('print')}
                            </Button>
                        </Grid>
                    </CardContent>

                    <Dialog fullWidth={true}
                        maxWidth="md"
                        open={shouldOpenPaymentModal}
                        onClose={e => {
                            setShouldOpenPaymentModal(false)
                        }}
                    >
                        <CardHeader title={t('settlement.payment_transfer')} />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs>
                                    <TextField
                                        disabled={Import.payment_type === '1'}
                                        required={Import.payment_type === '2'}
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('report.bank_transf_acc_number')}
                                        onChange={handleChange}
                                        value={Import.bank_transf_acc_number || ''}
                                        name='bank_transf_acc_number'
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs>
                                    <TextField
                                        disabled={Import.payment_type === '1'}
                                        fullWidth={true}
                                        margin="dense"
                                        required={Import.payment_type === '2'}
                                        autoComplete="off"
                                        label={t('report.bank_transf_acc_name')}
                                        onChange={handleChange}
                                        value={Import.bank_transf_acc_name || ''}
                                        name='bank_transf_acc_name'
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs>
                                    <Dictionary
                                        value={Import.bank_transf_name_s || ''}
                                        disabled={Import.payment_type === '1'}
                                        required={Import.payment_type === '2'}
                                        diectionName='bank_cd'
                                        onSelect={handleSelectTransfBank}
                                        label={t('report.bank_transf_name')}
                                        style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs>
                                    <TextField
                                        disabled={Import.payment_type === '1'}
                                        required={Import.payment_type === '2'}
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('report.bank_recei_acc_number')}
                                        onChange={handleChange}
                                        value={Import.bank_recei_acc_number || ''}
                                        name='bank_recei_acc_number'
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs>
                                    <TextField
                                        disabled={Import.payment_type === '1'}
                                        required={Import.payment_type === '2'}
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('report.bank_recei_acc_name')}
                                        onChange={handleChange}
                                        value={Import.bank_recei_acc_name || ''}
                                        name='bank_recei_acc_name'
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs>
                                    <Dictionary
                                        value={Import.bank_recei_name_s || ''}
                                        disabled={Import.payment_type === '1'}
                                        required={Import.payment_type === '2'}
                                        diectionName='bank_cd'
                                        onSelect={handleSelectReceiBank}
                                        label={t('report.bank_recei_name')}
                                        style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Dialog>
                </Card>
            </Grid>

            <div className='' style={{ display: 'none' }}>
                <Import_Bill
                    headerModal={Import}
                    detailModal={dataSource}
                    componentRef={componentPrint}
                />
            </div>

            {/* modal delete */}
            <Dialog maxWidth='sm' fullWidth={true}
                TransitionProps={{
                    addEndListener: (node, done) => {
                        // use the css transitionend event to mark the finish of a transition
                        node.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                handleDelete()
                            }
                        });
                    }

                }}
                open={shouldOpenDeleteModal}
                onClose={e => {
                    setShouldOpenDeleteModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('order.import.productDelete')} />
                    <CardContent>
                        <Grid container>{productDeleteModal.o_6 + ' - ' + t('order.import.qty') + ': ' + productDeleteModal.o_10 + ' ' + productDeleteModal.o_12 + ' (' + t('stt') + ' ' + productDeleteIndex + ')'}</Grid>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setShouldOpenDeleteModal(false)
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button className={deleteProcess ? 'button-loading' : ''} endIcon={deleteProcess && <LoopIcon />} size='small' onClick={handleDelete} variant="contained" color="secondary">
                            {t('btn.agree')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </Grid>
    )
}

export default memo(ProductImport)