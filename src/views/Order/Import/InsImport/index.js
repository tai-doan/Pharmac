import React, { useState, useRef, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Grid, Tooltip, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Button,
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
import EditProductRows from './EditProductRows'
import SupplierAdd_Autocomplete from '../../../Partner/Supplier/Control/SupplierAdd.Autocomplete'
import { useHotkeys } from 'react-hotkeys-hook'
import Dictionary from '../../../../components/Dictionary';
import AddProduct from '../AddProductClone'

const serviceInfo = {
    CREATE_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.IMPORT_CREATE,
        biz: 'import',
        object: 'imp_invoices'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    CREATE_SETTLEMENT: {
        functionName: 'insert',
        reqFunct: reqFunction.SETTLEMENT_IMPORT_CREATE,
        biz: 'settlement',
        object: 'imp_settl'
    }
}

const ProductImport = () => {
    const { t } = useTranslation()
    const [Import, setImport] = useState({ ...invoiceImportModal })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [dataSource, setDataSource] = useState([])
    const [productEditData, setProductEditData] = useState({})
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListAddColumn])
    const [shouldOpenPaymentModal, setShouldOpenPaymentModal] = useState(false)
    const [paymentInfo, setPaymentInfo] = useState({})

    const newInvoiceId = useRef(-1)
    const dataSourceRef = useRef([])
    const importDataRef = useRef(invoiceImportModal)
    const totalProductCountAdded = useRef(0)

    useHotkeys('f6', () => handleCreateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const importSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.IMPORT_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.PRODUCT_IMPORT_INVOICE_CREATE:
                        resultAddProductToInvoice(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.SETTLEMENT_IMPORT_CREATE:
                        resultCreateSettlement(msg, cltSeqResult, reqInfoMap)
                        return
                    default:
                        return
                }
            }
        })
        return () => {
            importSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        const newData = { ...paymentInfo }
        newData['invoice_val'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.qty * obj.price)
        }, 0) || 0
        newData['invoice_discount'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.discount_per / 100 * newData.invoice_val)
        }, 0) || 0
        newData['invoice_vat'] = dataSource.reduce(function (acc, obj) {
            return acc + Math.round(obj.vat_per / 100 * Math.round(newData.invoice_val * (1 - (obj.discount_per / 100))))
        }, 0) || 0
        newData['invoice_needpay'] = newData.invoice_val - newData.invoice_discount + newData.invoice_vat || 0
        setPaymentInfo(newData)
    }, [dataSource])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const resultCreate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            let newData = message['PROC_DATA']
            if (!!newData.rows[0].o_1) {
                newInvoiceId.current = newData.rows[0].o_1
                addProductToInvoice(newData.rows[0].o_1)
            }
        }
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

    const resultAddProductToInvoice = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            totalProductCountAdded.current++
            if (totalProductCountAdded.current === dataSourceRef.current.length - 1) {
                createSettlement(newInvoiceId.current)
            }
        }
    }

    const addProductToInvoice = invoiceNo => {
        for (let i = 0; i < dataSourceRef.current.length; i++) {
            const item = dataSourceRef.current[i];
            const inputParam = [
                invoiceNo || newInvoiceId.current,
                item.imp_tp,
                item.prod_id,
                item.lot_no,
                item.made_dt,
                item.exp_dt,
                item.qty,
                item.unit_id,
                item.price,
                item.discount_per,
                item.vat_per
            ]
            sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, null, true, handleTimeOut)
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
        newImport['payment_amount'] = Math.round(value.floatValue)
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
        let converted = { ...productObject }
        converted.exp_dt = moment(converted.exp_dt).format('YYYYMMDD')
        let newDataSource = [...dataSource]
        newDataSource.push(converted);
        dataSourceRef.current = newDataSource
        setDataSource(newDataSource)
    }

    const handleEditProduct = productObject => {
        if (productObject === null) {
            setProductEditData({})
            setProductEditID(-1);
            return
        }
        let converted = { ...productObject }
        converted.exp_dt = moment(converted.exp_dt).format('YYYYMMDD')
        let newDataSource = [...dataSource]
        newDataSource[productEditID] = converted
        dataSourceRef.current = newDataSource
        setDataSource([...newDataSource])
        setProductEditData({})
        setProductEditID(-1);
    }

    const onRemove = index => {
        let newDataSource = [...dataSource]
        newDataSource.splice(index, 1)
        dataSourceRef.current = newDataSource
        setDataSource([...newDataSource])
    }

    const checkValidate = () => {
        if (dataSource.length > 0 && !!Import.supplier && !!Import.order_dt && Import.payment_amount > 0) {
            return false
        }
        return true
    }

    const handleCreateInvoice = () => {
        if (dataSource.length <= 0 || !Import.supplier || !Import.order_dt) return
        if (!Import.payment_type || !Import.payment_amount || Import.payment_amount <= 0) return
        if (!Import.payment_type === '2' &&
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
        sendRequest(serviceInfo.CREATE_INVOICE, inputParam, null, true, handleTimeOut)
    }

    return (
        <Grid container spacing={1}>
            <EditProductRows productEditID={productEditID} productData={productEditData} handleEditProduct={handleEditProduct} />
            <Grid item md={9} xs={12}>
                <AddProduct onAddProduct={handleAddProduct} />
                <Card>
                    <CardHeader
                        title={t('order.import.productImportList')}
                    />
                    <CardContent>
                        <TableContainer className="tableContainer">
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
                                                setProductEditData(item);
                                                setProductEditID(index)
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
                                                                                onRemove(index)
                                                                            }}
                                                                        >
                                                                            <DeleteIcon style={{ color: 'red' }} fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            onClick={e => {
                                                                                setProductEditData(item);
                                                                                setProductEditID(index)
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
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('order.import.invoice_no')}
                                    className="uppercaseInput"
                                    onChange={handleChange}
                                    value={Import.invoice_no || ''}
                                    name='invoice_no'
                                    variant="outlined"
                                />
                            </Tooltip>
                            <div className='d-flex align-items-center w-100'>
                                <SupplierAdd_Autocomplete
                                    value={supplierSelect || ''}
                                    size={'small'}
                                    label={t('menu.supplier')}
                                    onSelect={handleSelectSupplier}
                                    onCreate={handleCreateSupplier}
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
                            />
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={paymentInfo.invoice_val}
                                label={t('order.import.invoice_val')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={paymentInfo.invoice_discount}
                                label={t('order.import.invoice_discount')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={paymentInfo.invoice_vat}
                                label={t('order.import.invoice_vat')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
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
                            <NumberFormat
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={Import.payment_amount - paymentInfo.invoice_needpay}
                                label={t('settlement.excess_cash')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <LinkMT href="#" onClick={() => setShouldOpenPaymentModal(true)} variant="body2" color='error'>
                                {t('settlement.payment_type')} ({Import.payment_type === '1' ? t('settlement.cash') : t('settlement.bank_transfer')})
                            </LinkMT>
                        </Grid>
                        <Grid container spacing={1} className='mt-2'>
                            <Button
                                onClick={() => {
                                    handleCreateInvoice();
                                }}
                                variant="contained"
                                disabled={checkValidate()}
                                className={checkValidate() === false ? 'bg-success text-white' : ''}
                            >
                                {t('btn.payment')}
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
                        <CardHeader title={t('settlement.payment_type')} />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs>
                                    <FormControl margin="dense" variant="outlined" className='w-100'>
                                        <InputLabel id="payment_type">{t('settlement.payment_type')}</InputLabel>
                                        <Select
                                            labelId="payment_type"
                                            id="payment_type-select"
                                            value={Import.payment_type || '1'}
                                            onChange={handleChange}
                                            label={t('settlement.payment_type')}
                                            name='payment_type'
                                        >
                                            <MenuItem value="1">{t('settlement.cash')}</MenuItem>
                                            <MenuItem value="2">{t('settlement.bank_transfer')}</MenuItem>
                                        </Select>
                                    </FormControl>
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
                            </Grid>
                            <Grid container spacing={2}>
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
                            </Grid>
                        </CardContent>
                    </Dialog>
                </Card>
            </Grid>
        </Grid>
    )
}

export default memo(ProductImport)