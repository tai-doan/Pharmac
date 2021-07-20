import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Button, TextField, Card, CardHeader, CardContent } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Dictionary_Autocomplete from '../../../../components/Dictionary_Autocomplete'
import NumberFormat from 'react-number-format'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'

import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'
import socket_sv from '../../../../utils/service/socket_service'
import SnackBarService from '../../../../utils/service/snackbar_service'
import { requestInfo } from '../../../../utils/models/requestInfo'
import reqFunction from '../../../../utils/constan/functions';
import sendRequest from '../../../../utils/service/sendReq'

import { tableListEditColumn, invoiceExportRepayModal } from '../Modal/ExportRepay.modal'
import moment from 'moment'
import AddProduct from '../AddProduct'

import { Link } from 'react-router-dom'
import EditProductRows from './EditProductRows'
import SupplierAdd_Autocomplete from '../../../Partner/Supplier/Control/SupplierAdd.Autocomplete'
import { useHotkeys } from 'react-hotkeys-hook'

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
    UPDATE_PRODUCT_TO_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_UPDATE,
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
    const [productEditData, setProductEditData] = useState({})
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListEditColumn])

    useHotkeys('f6', () => handleUpdateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        const exportRepaySub = socket_sv.event_ClientReqRcv.subscribe(msg => {
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
                    case reqFunction.EXPORT_REPAY_BY_ID:
                        resultGetInvoiceByID(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.EXPORT_REPAY_UPDATE:
                        resultUpdateInvoice(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_CREATE:
                        resultActionProductToInvoice(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID:
                        resultGetProductByInvoiceID(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_UPDATE:
                        resultActionProductToInvoice(msg, cltSeqResult, reqInfoMap)
                        break
                        case reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_DELETE:
                            resultDeleteProduct(msg, cltSeqResult, reqInfoMap)
                            return
                    default:
                        return
                }
            }
        })

        if (id !== 0) {
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [id], e => console.log(e), true, handleTimeOut)
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
        return () => {
            exportRepaySub.unsubscribe()
        }
    }, [])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const resultGetInvoiceByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            let newData = message['PROC_DATA']
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
                note: newData.rows[0].o_10
            }
            setSupplierSelect(newData.rows[0].o_5)
            setExportRepay(dataExportRepay)
        }
    }

    const resultGetProductByInvoiceID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        console.log('resultGetProductByInvoiceID: ', message)
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else {
            let newData = message['PROC_DATA']
            setDataSource(newData.rows)
        }
    }

    const resultActionProductToInvoice = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID, [ExportRepay.invoice_id || id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }

    const resultUpdateInvoice = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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

        }
    }

    const resultDeleteProduct = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_REPAY_ID, [id], null, true, handleTimeOut)
        }
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

    const handleAddProduct = productObject => {
        if (!productObject) {
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
        sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const handleEditProduct = productObject => {
        if (productObject === null) {
            setProductEditData({})
            setProductEditID(-1);
            return
        }
        const inputParam = [
            ExportRepay.invoice_id,
            productEditID,
            productObject.qty,
            productObject.price,
            productObject.discount_per,
            productObject.vat_per
        ]
        sendRequest(serviceInfo.UPDATE_PRODUCT_TO_INVOICE, inputParam, e => console.log(e), true, handleTimeOut)
        setProductEditData({})
        setProductEditID(-1);
    }

    const onRemove = item => {
        if (!item) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        const inputParam = [item.o_2, item.o_1];
        sendRequest(serviceInfo.DELETE_PRODUCT_TO_INVOICE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const checkValidate = () => {
        if (dataSource.length > 0 && !!ExportRepay.supplier_id && !!ExportRepay.order_dt) {
            return false
        }
        return true
    }

    const handleUpdateInvoice = () => {
        if (!ExportRepay.invoice_id || dataSource.length <= 0 || !ExportRepay.supplier_id || !ExportRepay.order_dt) {
            SnackBarService.alert(t('can_not_found_id_invoice_please_try_again'), true, 'error', 3000)
            return
        }
        //bắn event update invoice
        const inputParam = [
            ExportRepay.invoice_id,
            ExportRepay.supplier_id,
            moment(ExportRepay.order_dt).format('YYYYMMDD'),
            ExportRepay.staff_exp,
            ExportRepay.note
        ];
        sendRequest(serviceInfo.UPDATE_INVOICE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const onDoubleClickRow = rowData => {
        if (!rowData) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        setProductEditID(rowData.o_1)
    }

    return (
        <Grid container spacing={1}>
            <EditProductRows productEditID={productEditID} productData={productEditData} handleEditProduct={handleEditProduct} />
            <Grid item md={9} xs={12}>
                <Card>
                    {/* <div className='d-flex justify-content-between align-items-center mr-2'>
                        <Link to="/page/order/exportRepay" className="normalLink">
                            <Button variant="contained" size="small">
                                {t('btn.back')}
                            </Button>
                        </Link>
                        
                    </div> */}
                    <CardHeader
                        title={t('order.exportRepay.productExportRepayList')}
                        action={
                            <AddProduct handleAddProduct={handleAddProduct} />
                        }
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
                                                                            }}
                                                                        >
                                                                            <DeleteIcon style={{ color: 'red' }} fontSize="small" />
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
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('order.exportRepay.invoice_no')}
                                disabled={true}
                                value={ExportRepay.invoice_no || ''}
                                name='invoice_no'
                                variant="outlined"
                            />
                            {/* <Dictionary_Autocomplete
                                diectionName='venders'
                                value={supplierSelect || ''}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                size={'small'}
                                label={t('menu.supplier')}
                                onSelect={handleSelectSupplier}
                            /> */}
                            <div className='d-flex align-items-center w-100'>
                                <SupplierAdd_Autocomplete
                                    value={supplierSelect || ''}
                                    size={'small'}
                                    label={t('menu.supplier')}
                                    onSelect={handleSelectSupplier}
                                    onCreate={id => setExportRepay({ ...ExportRepay, ...{ supplier_id: id } })}
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
                                />
                            </MuiPickersUtilsProvider>
                            <NumberFormat className='inputNumber' 
                                style={{ width: '100%' }}
                                required
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.o_7 * obj.o_10)
                                }, 0) || 0}
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
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.o_11 / 100 * (obj.o_7 * obj.o_10))
                                }, 0) || 0}
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
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.o_12 / 100 * Math.round(obj.o_7 * obj.o_10 * (1 - (obj.o_11 / 100))))
                                }, 0) || 0}
                                label={t('order.exportRepay.invoice_vat')}
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
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(Math.round(obj.o_7 * obj.o_10) - Math.round(obj.o_11 / 100 * (obj.o_7 * obj.o_10)))
                                }, 0) || 0}
                                label={t('order.exportRepay.invoice_needpay')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                disabled={true}
                            />
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.exportRepay.staff_exp')}
                                onChange={handleChange}
                                value={ExportRepay.staff_exp || ''}
                                name='staff_exp'
                                variant="outlined"
                            />
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
                            />
                        </Grid>
                        <Grid container spacing={1} className='mt-2'>
                            <Button size='small'
                                onClick={() => {
                                    handleUpdateInvoice();
                                }}
                                variant="contained"
                                disabled={checkValidate()}
                                className={checkValidate() === false ? 'bg-success text-white' : ''}
                            >
                                {t('btn.update')}
                            </Button>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default EditExportRepay