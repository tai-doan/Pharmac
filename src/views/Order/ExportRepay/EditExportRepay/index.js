import React, { useState, useEffect, useRef } from 'react'
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
import SnackBarService from '../../../../utils/service/snackbar_service'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'

import { tableListEditColumn, invoiceExportRepayModal } from '../Modal/ExportRepay.modal'
import moment from 'moment'
import AddProduct from '../AddProductClone'

import EditProductRows from './EditProductRows'
import SupplierAdd_Autocomplete from '../../../Partner/Supplier/Control/SupplierAdd.Autocomplete'
import { useHotkeys } from 'react-hotkeys-hook'
import { useReactToPrint } from 'react-to-print';
import Export_Repay_Bill from '../../../../components/Bill/Export_Repay_Bill'
import ExportExcel from '../../../../components/ExportExcel'

const serviceInfo = {
    GET_INVOICE_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.EXPORT_REPAY_BY_ID,
        biz: 'export',
        object: 'exp_repay'
    },
    UPDATE_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.EXPORT_REPAY_UPDATE,
        biz: 'export',
        object: 'exp_repay'
    },
    GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID: {
        functionName: 'get_all',
        reqFunct: reqFunction.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID,
        biz: 'export',
        object: 'exp_repay_dt'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_CREATE,
        biz: 'export',
        object: 'exp_repay_dt'
    },
    DELETE_PRODUCT_TO_INVOICE: {
        functionName: 'delete',
        reqFunct: reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_DELETE,
        biz: 'export',
        object: 'exp_repay_dt'
    }
}

const EditExportRepay = ({ }) => {
    const { t } = useTranslation()
    const history = useHistory()
    const { id } = history?.location?.state || 0
    const [ExportRepay, setExportRepay] = useState({ ...invoiceExportRepayModal })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [dataSource, setDataSource] = useState([])
    const [productDeleteIndex, setProductDeleteIndex] = useState(null)
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListEditColumn])
    const [productDeleteModal, setProductDeleteModal] = useState({})
    const [paymentInfo, setPaymentInfo] = useState({})
    const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false)
    const [resetFormAddFlag, setResetFormAddFlag] = useState(false)
    const [deleteProcess, setDeleteProcess] = useState(false)
    const [updateProcess, setUpdateProcess] = useState(false)

    const componentPrint = useRef(null)
    const newInvoiceId = useRef(-1)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    useHotkeys('f6', () => handleUpdateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        if (id !== 0) {
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [id], handleResultGetInvoiceByID, true, handleTimeOut)
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID, [id], handleGetAllProductByInvoiceID, true, handleTimeOut)
        }
    }, [])

    useEffect(() => {
        const newData = { ...paymentInfo }
        newData['invoice_val'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.o_5 * obj.o_8)
        }, 0) || 0
        newData['invoice_discount'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.o_9 / 100 * newData.invoice_val)
        }, 0) || 0
        newData['invoice_vat'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.o_10 / 100 * Math.round(newData.invoice_val * (1 - (obj.o_9 / 100))))
        }, 0) || 0
        newData['invoice_needpay'] = newData.invoice_val - newData.invoice_discount + newData.invoice_vat || 0
        setExportRepay(prevState => { return { ...prevState, ...{ payment_amount: newData.invoice_needpay } } })
        setPaymentInfo(newData)
    }, [dataSource])

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
            newInvoiceId.current = newData.rows[0].o_1;
            let dataExportRepay = {
                invoice_id: newData.rows[0].o_1,
                invoice_no: newData.rows[0].o_2,
                invoice_stat: newData.rows[0].o_3,
                supplier_id: newData.rows[0].o_4,
                supplier: newData.rows[0].o_5,
                order_dt: moment(newData.rows[0].o_6, 'YYYYMMDD').toString(),
                input_dt: moment(newData.rows[0].o_7, 'YYYYMMDD').toString(),
                staff_exp: newData.rows[0].o_8,
                cancel_reason: newData.rows[0].o_9,
                note: newData.rows[0].o_10,
                invoice_val: newData.rows[0].o_12,
                invoice_discount: newData.rows[0].o_13,
                invoice_vat: newData.rows[0].o_14
            }
            console.log(newData, dataExportRepay)
            setSupplierSelect(newData.rows[0].o_5)
            setExportRepay(dataExportRepay)
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

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleSelectSupplier = obj => {
        const newExportRepay = { ...ExportRepay };
        newExportRepay['supplier_id'] = !!obj ? obj?.o_1 : null
        setSupplierSelect(!!obj ? obj?.o_2 : '')
        setExportRepay(newExportRepay)
    }

    const handleDateChange = date => {
        const newExportRepay = { ...ExportRepay };
        newExportRepay['order_dt'] = date;
        setExportRepay(newExportRepay)
    }

    const handleChange = e => {
        const newExportRepay = { ...ExportRepay };
        newExportRepay[e.target.name] = e.target.value
        setExportRepay(newExportRepay)
    }

    const handleAmountChange = value => {
        const newExportRepay = { ...ExportRepay };
        newExportRepay['payment_amount'] = Number(value.value)
        setExportRepay(newExportRepay)
    }

    const handleAddProduct = productObject => {
        if (productObject && Object.keys(productObject).length === 0 && productObject.constructor === Object) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        const inputParam = [
            ExportRepay.invoice_id,
            productObject.prod_id,
            productObject.lot_no,
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
            handleRefresh()
        }
    }

    const onRemove = item => {
        if (!item) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        setProductDeleteModal(!!item ? item : {})
        setShouldOpenDeleteModal(!!item ? true : false)
    }

    const handleDelete = () => {
        if (!productDeleteModal.o_1 || (!ExportRepay.invoice_id && !newInvoiceId.current)) return
        const inputParam = [ExportRepay.invoice_id || newInvoiceId.current, productDeleteModal.o_1];
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
        if (!!ExportRepay.supplier_id && !!ExportRepay.order_dt) {
            return false
        }
        return true
    }

    const handleUpdateInvoice = () => {
        if (!ExportRepay.invoice_id) {
            SnackBarService.alert(t('can_not_found_id_invoice_please_try_again'), true, 'error', 3000)
            return
        } else if (!ExportRepay.supplier_id || !ExportRepay.order_dt) {
            SnackBarService.alert(t('message.requireExportRepayInvoice'), true, 'error', 3000)
            return
        }
        setUpdateProcess(true)
        //bắn event update invoice
        const inputParam = [
            ExportRepay.invoice_id,
            ExportRepay.supplier_id,
            moment(ExportRepay.order_dt).format('YYYYMMDD'),
            ExportRepay.staff_exp,
            ExportRepay.note
        ];
        sendRequest(serviceInfo.UPDATE_INVOICE, inputParam, handleResultUpdateInvoice, true, e => { handleTimeOut(e); setUpdateProcess(false) })
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
            // xử lý thành công
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
        }
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceId.current], handleResultGetInvoiceByID, true, handleTimeOut)
        sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID, [newInvoiceId.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
    }

    const onDoubleClickRow = rowData => {
        if (!rowData) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        setProductEditID(rowData.o_1)
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('order.export.prod_nm'), key: 'prod_nm' },
        { label: t('order.export.lot_no'), key: 'lot_no' },
        { label: t('order.export.qty'), key: 'qty' },
        { label: t('order.export.unit_nm'), key: 'unit_nm' },
        { label: t('order.export.price'), key: 'price' },
        { label: t('order.export.discount_per'), key: 'discount_per' },
        { label: t('order.export.vat_per'), key: 'vat_per' },
        { label: t(''), key: 'space_01' },
        { label: t('order.export.invoice_no'), key: 'invoice_no' },
        { label: t('order.exportRepay.supplier_nm'), key: 'supplier_nm' },
        { label: t('order.export.order_dt'), key: 'order_dt' },
        { label: t('order.export.note'), key: 'note' },
        { label: t('order.export.invoice_val'), key: 'invoice_val' },
        { label: t('order.export.invoice_discount'), key: 'invoice_discount' },
        { label: t('order.export.invoice_vat'), key: 'invoice_vat' }
    ]

    const dataCSV = () => {
        let result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['prod_nm'] = data.o_3
            item['lot_no'] = data.o_4
            item['qty'] = data.o_5
            item['unit_nm'] = data.o_7
            item['price'] = data.o_18
            item['discount_per'] = data.o_9
            item['vat_per'] = data.o_10

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
            result[0].invoice_no = ExportRepay.invoice_no
            result[0].supplier_nm = ExportRepay.supplier
            result[0].order_dt = ExportRepay.order_dt ? moment(ExportRepay.order_dt).format('DD/MM/YYYY') : ''
            result[0].invoice_val = ExportRepay.invoice_val
            result[0].invoice_discount = ExportRepay.invoice_discount
            result[0].invoice_vat = ExportRepay.invoice_vat
            result[0].note = ExportRepay.note
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
                        title={t('order.exportRepay.productExportRepayList')}
                        action={<ExportExcel filename={`export_repay_${ExportRepay.invoice_no}`} data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />}
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
                                                            case 'exp_tp':
                                                                return (
                                                                    <TableCell nowrap="true" nowrap="true" key={indexRow} align={col.align}>
                                                                        {value === '1' ? t('order.exportRepay.exportRepay_type_buy') : t('order.exportRepay.exportRepay_type_selloff')}
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
                    <CardHeader title={t('order.exportRepay.invoice_info')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.exportRepay.invoice_no')}
                                disabled={true}
                                value={ExportRepay.invoice_no || ''}
                                name='invoice_no'
                                variant="outlined"
                            />
                            <div className='d-flex align-items-center w-100'>
                                <SupplierAdd_Autocomplete
                                    value={supplierSelect || ''}
                                    size={'small'}
                                    label={t('menu.supplier')}
                                    onSelect={handleSelectSupplier}
                                    onCreate={id => setExportRepay({ ...ExportRepay, ...{ supplier_id: id } })}
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
                                    label={t('order.exportRepay.order_dt')}
                                    value={ExportRepay.order_dt}
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
                                label={t('order.exportRepay.note')}
                                onChange={handleChange}
                                value={ExportRepay.note || ''}
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
                                required
                                value={ExportRepay.invoice_val || 0}
                                label={t('order.exportRepay.invoice_val')}
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
                                value={ExportRepay.invoice_discount || 0}
                                label={t('order.exportRepay.invoice_discount')}
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
                                value={ExportRepay.invoice_vat || 0}
                                label={t('order.exportRepay.invoice_vat')}
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
                                required
                                value={paymentInfo.invoice_needpay || 0}
                                label={t('order.exportRepay.invoice_needpay')}
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
                                value={ExportRepay.payment_amount}
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
                                value={ExportRepay.payment_amount - paymentInfo.invoice_needpay > 0 ? ExportRepay.payment_amount - paymentInfo.invoice_needpay : 0}
                                label={t('settlement.excess_cash')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            {/* <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.exportRepay.staff_exp')}
                                onChange={handleChange}
                                value={ExportRepay.staff_exp || ''}
                                name='staff_exp'
                                variant="outlined"
                            /> */}
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
                                className='bg-print text-white'
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
                <Export_Repay_Bill
                    headerModal={ExportRepay}
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
                    <CardHeader title={t('order.export.productDelete')} />
                    <CardContent>
                        <Grid container>{productDeleteModal.o_3 + ' - ' + t('order.export.qty') + ': ' + productDeleteModal.o_5 + ' ' + productDeleteModal.o_7 + ' (' + t('stt') + ' ' + productDeleteIndex + ')'}</Grid>
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

export default EditExportRepay