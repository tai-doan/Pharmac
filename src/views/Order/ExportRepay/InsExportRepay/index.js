import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Tooltip, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Button, TextField, Card, CardHeader, CardContent } from '@material-ui/core'
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

import { tableListAddColumn, invoiceExportRepayModal } from '../Modal/ExportRepay.modal'
import moment from 'moment'
import AddProduct from '../AddProduct'

import { Link } from 'react-router-dom'
import EditProductRows from './EditProductRows'
import SupplierAdd_Autocomplete from '../../../Partner/Supplier/Control/SupplierAdd.Autocomplete'
import { useHotkeys } from 'react-hotkeys-hook'

const serviceInfo = {
    CREATE_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.EXPORT_REPAY_CREATE,
        biz: 'export',
        object: 'exp_repay'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_CREATE,
        biz: 'export',
        object: 'exp_repay_dt'
    }
}

const InsExportRepay = ({ }) => {
    const { t } = useTranslation()
    const [ExportRepay, setExportRepay] = useState({ ...invoiceExportRepayModal })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [dataSource, setDataSource] = useState([])
    const [productEditData, setProductEditData] = useState({})
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListAddColumn])

    const newInvoiceId = useRef(-1)
    const dataSourceRef = useRef([])

    useHotkeys('f6', () => handleCreateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
                    case reqFunction.EXPORT_REPAY_CREATE:
                        resultCreate(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.PRODUCT_EXPORT_REPAY_INVOICE_CREATE:
                        resultAddProductToInvoice(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })
        return () => {
            exportRepaySub.unsubscribe()
        }
    }, [])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
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
                for (let i = 0; i < dataSourceRef.current.length; i++) {
                    const item = dataSourceRef.current[i];
                    const inputParam = [
                        newData.rows[0].o_1,
                        item.prod_id,
                        item.lot_no,
                        item.qty,
                        item.unit_id,
                        item.price,
                        item.vat_per,
                        item.discount_per
                    ]
                    sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, e => console.log(e), true, handleTimeOut)
                    if (i === dataSourceRef.current.length - 1) {
                        dataSourceRef.current = [];
                        setDataSource([])
                        setExportRepay({ ...invoiceExportRepayModal })
                        setSupplierSelect('')
                    }
                }
            }
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
            let newData = message['PROC_DATA']
            console.log('message thêm sản phẩm vô HĐ: ', message, newData)
        }
    }

    const handleSelectCustomer = obj => {
        const newExportRepay = { ...ExportRepay };
        newExportRepay['supplier'] = !!obj ? obj?.o_1 : null
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
        let newDataSource = [...dataSource]
        newDataSource.push(productObject);
        dataSourceRef.current = newDataSource
        setDataSource(newDataSource)
    }

    const handleEditProduct = productObject => {
        if (productObject === null) {
            setProductEditData({})
            setProductEditID(-1);
            return
        }
        let newDataSource = [...dataSource]
        newDataSource[productEditID] = productObject
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
        if (dataSource.length > 0 && !!ExportRepay.supplier && !!ExportRepay.order_dt) {
            return false
        }
        return true
    }

    const handleCreateInvoice = () => {
        if (dataSource.length <= 0 || !ExportRepay.supplier || !ExportRepay.order_dt) return
        //bắn event tạo invoice
        const inputParam = [
            !!ExportRepay.invoice_no.trim() ? ExportRepay.invoice_no.trim() : 'AUTO',
            ExportRepay.supplier,
            moment(ExportRepay.order_dt).format('YYYYMMDD'),
            ExportRepay.staff_exp,
            ExportRepay.note
        ];
        sendRequest(serviceInfo.CREATE_INVOICE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    return (
        <Grid container spacing={1}>
            <EditProductRows productEditID={productEditID} productData={productEditData} handleEditProduct={handleEditProduct} />
            <Grid item md={9} xs={12}>
                {/* <div className='d-flex justify-content-between  align-items-center mr-2'>
                    <Link to="/page/order/exportRepay" className="normalLink">
                        <Button variant="contained" size="small">
                            {t('btn.back')}
                        </Button>
                    </Link>
                </div> */}
                <Card>
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
                            <Tooltip placement="top" title={t('auto_invoice')} arrow>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    rows={1}
                                    autoComplete="off"
                                    label={t('order.exportRepay.invoice_no')}
                                    onChange={handleChange}
                                    value={ExportRepay.invoice_no || ''}
                                    name='invoice_no'
                                    variant="outlined"
                                />
                            </Tooltip>
                            {/* <Dictionary_Autocomplete
                                diectionName='venders'
                                onSelect={handleSelectCustomer}
                                label={t('menu.supplier')}
                                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                                size={'small'}
                                value={supplierSelect || ''}
                            /> */}
                            <div className='d-flex align-items-center w-100'>
                                <SupplierAdd_Autocomplete
                                    value={supplierSelect || ''}
                                    size={'small'}
                                    label={t('menu.supplier')}
                                    onSelect={handleSelectCustomer}
                                    onCreate={id => setExportRepay({ ...ExportRepay, ...{ supplier: id } })}
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.qty * obj.price)
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.discount_per / 100 * (obj.qty * obj.price))
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.vat_per / 100 * Math.round(obj.qty * obj.price * (1 - (obj.discount_per / 100))))
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
                            <NumberFormat
                                style={{ width: '100%' }}
                                required
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(Math.round(obj.qty * obj.price) - Math.round(obj.discount_per / 100 * (obj.qty * obj.price)))
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
                                multiline
                                rows={1}
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
                                    handleCreateInvoice();
                                }}
                                variant="contained"
                                disabled={checkValidate()}
                                className={checkValidate() === false ? 'bg-success text-white' : ''}
                            >
                                {t('btn.save')}
                            </Button>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default InsExportRepay