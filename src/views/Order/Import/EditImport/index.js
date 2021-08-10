import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Button, TextField, Card, CardHeader, CardContent, Divider, Dialog, CardActions } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import NumberFormat from 'react-number-format'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import LoopIcon from '@material-ui/icons/Loop'

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import SnackBarService from '../../../../utils/service/snackbar_service'
import { requestInfo } from '../../../../utils/models/requestInfo'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'

import { tableListEditColumn, invoiceImportModal } from '../Modal/Import.modal'
import moment from 'moment'
import AddProduct from '../AddProductClone'

import EditProductRows from './EditProductRows'
import SupplierAdd_Autocomplete from '../../../Partner/Supplier/Control/SupplierAdd.Autocomplete'
import { useHotkeys } from 'react-hotkeys-hook'
import { useReactToPrint } from 'react-to-print';
import Import_Bill from '../../../../components/Bill/Import_Bill'
import ExportExcel from '../../../../components/ExportExcel'

const serviceInfo = {
    GET_INVOICE_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.IMPORT_BY_ID,
        biz: 'import',
        object: 'imp_invoices'
    },
    UPDATE_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.IMPORT_UPDATE,
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

const EditImport = ({ }) => {
    const { t } = useTranslation()
    const history = useHistory()
    const { id } = history?.location?.state || 0
    const [Import, setImport] = useState({ ...invoiceImportModal })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [dataSource, setDataSource] = useState([])
    const [productDeleteModal, setProductDeleteModal] = useState({})
    const [productDeleteIndex, setProductDeleteIndex] = useState(null)
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListEditColumn])
    const [paymentInfo, setPaymentInfo] = useState({})
    const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false)
    const [resetFormAddFlag, setResetFormAddFlag] = useState(false)
    const [deleteProcess, setDeleteProcess] = useState(false)
    const [updateProcess, setUpdateProcess] = useState(false)

    const componentPrint = useRef(null)
    const newInvoiceId = useRef(-1)
    const dataSourceRef = useRef([])
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    useHotkeys('f6', () => handleUpdateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (id !== 0) {
            newInvoiceId.current = id
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [id], handleResultGetInvoiceByID, true, handleTimeOut)
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [id], handleGetAllProductByInvoiceID, true, handleTimeOut)
        }
        return () => {
            history.replace({
                ...history?.location,
                state: undefined,
            });
        }
    }, [])

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
        setImport(prevState => { return { ...prevState, ...{ payment_amount: newData.invoice_needpay } } })
        setPaymentInfo(newData)
    }, [dataSource])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setUpdateProcess(false)
        setDeleteProcess(false)
    }

    const resultCreateSettlement = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        console.log('create settlement result: ', reqInfoMap, message)
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [id], handleResultGetInvoiceByID, true, handleTimeOut)
        }
    }

    const handleSelectSupplier = obj => {
        const newImport = { ...Import };
        newImport['supplier'] = !!obj ? obj?.o_1 : null
        setSupplierSelect(!!obj ? obj?.o_2 : '')
        setImport(newImport)
    }

    const handleDateChange = date => {
        const newImport = { ...Import };
        newImport['order_dt'] = date;
        setImport(newImport)
    }

    const handleAmountChange = value => {
        const newImport = { ...Import };
        newImport['payment_amount'] = Number(value.value)
        setImport(newImport)
    }

    const handleChange = e => {
        const newImport = { ...Import };
        newImport[e.target.name] = e.target.value
        setImport(newImport)
    }

    const handleAddProduct = productObject => {
        // if (!productObject || !productObject.prod_id || !productObject.lot_no || !productObject.qty || productObject.qty <= 0 ||
        //     !productObject.unit_id || !productObject.price || productObject.price <= 0 || !productObject.discount_per || productObject.discount_per <= 0 ||
        //     productObject.discount_per > 100 || !productObject.vat_per || productObject.vat_per <= 0 || productObject.vat_per > 100) {
        //     SnackBarService.alert(t('wrongData'), true, 'error', 3000)
        //     return
        // }
        const inputParam = [
            Import.invoice_id,
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

    const handleResultAddProductToInvoice = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setResetFormAddFlag(true)
            setTimeout(() => {
                setResetFormAddFlag(false)
            }, 1000);
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [newInvoiceId.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
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
            // xử lý thành công
            setProductDeleteIndex(null)
            setProductDeleteModal({})
            setShouldOpenDeleteModal(false)
            handleRefresh()
        }
    }

    const checkValidate = () => {
        if (dataSource.length > 0 && !!Import.supplier && !!Import.order_dt) {
            return false
        }
        return true
    }

    const handleUpdateInvoice = () => {
        if (!Import.invoice_id) {
            SnackBarService.alert(t('can_not_found_id_invoice_please_try_again'), true, 'error', 3000)
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

    const handleResultGetInvoiceByID = (reqInfoMap, message) => {
        // SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            console.log('handleResultGetInvoiceByID: ', reqInfoMap, message)
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

    const onDoubleClickRow = rowData => {
        if (!rowData) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        setProductEditID(rowData.o_1)
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
        sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [newInvoiceId.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
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
            item['invoice_no'] = Import.invoice_no
            item['supplier_nm'] = Import.supplier_nm
            item['order_dt'] = Import.order_dt ? moment(Import.order_dt).format('DD/MM/YYYY') : ''
            item['invoice_val'] = Import.invoice_val
            item['invoice_discount'] = Import.invoice_discount
            item['invoice_vat'] = Import.invoice_vat
            item['note'] = Import.note
            return item
        })
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
                    {/* <div className='d-flex justify-content-between align-items-center mr-2'>
                        <Link to="/page/order/import" className="normalLink">
                            <Button variant="contained" size="small">
                                {t('btn.back')}
                            </Button>
                        </Link>
                        
                    </div> */}
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
                                            <TableRow onDoubleClick={e => { onDoubleClickRow(item) }} hover role="checkbox" tabIndex={-1} key={index}>
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
                                                                                onDoubleClickRow(item)
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
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.import.invoice_no')}
                                className="uppercaseInput"
                                disabled={true}
                                value={Import.invoice_no || ''}
                                name='invoice_no'
                                variant="outlined"
                            />
                            <div className='d-flex align-items-center w-100'>
                                <SupplierAdd_Autocomplete
                                    value={supplierSelect || ''}
                                    size={'small'}
                                    label={t('menu.supplier')}
                                    onSelect={handleSelectSupplier}
                                    onCreate={id => setImport({ ...Import, ...{ supplier: id } })}
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
                            {/* <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                value={Import.invoice_settl}
                                label={t('order.import.invoice_settl')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            /> */}
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
                        </Grid>
                        <Grid container spacing={1} className='mt-2'>
                            <Button size='small'
                                style={{ width: 'calc(60% - 0.25rem)', marginRight: '0.5rem' }}
                                onClick={() => {
                                    handleUpdateInvoice();
                                }}
                                variant="contained"
                                disabled={checkValidate()}
                                className={checkValidate() === false ? updateProcess ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                                endIcon={updateProcess && <LoopIcon />}
                            >
                                {t('btn.payment')}
                            </Button>
                            <Button
                                onClick={handlePrint}
                                className={'bg-print text-white'}
                                id='buttonPrint'
                                size='smail'
                                variant="contained"
                                style={{ width: 'calc(40% - 0.25rem)' }}
                            >
                                {t('print')}
                            </Button>
                        </Grid>
                    </CardContent>
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

export default EditImport