import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Supplier_Autocomplete from '../../Partner/Supplier/Control/Supplier.Autocomplete'
import NumberFormat from 'react-number-format'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableListAddColumn, invoiceImportModal } from './Modal/InsImport.Modal'
import moment from 'moment'
import ProductImportAdd from '../Import/ProductImportAdd'

import { Link } from 'react-router-dom'
import EditProductRows from './EditProductRows'

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
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    UPDATE_PRODUCT_TO_INVOICE: {
        functionName: 'update',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_UPDATE,
        biz: 'import',
        object: 'imp_invoices_dt'
    },
    DELETE_PRODUCT_TO_INVOICE: {
        functionName: 'delete',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_DELETE,
        biz: 'import',
        object: 'imp_invoices_dt'
    }
}

const EditImport = ({ }) => {
    const { t } = useTranslation()
    const history = useHistory()
    const { id } = history?.location?.state || { id: 0 }
    const [Import, setImport] = useState({ ...invoiceImportModal })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [dataSource, setDataSource] = useState([])
    const [productEditData, setProductEditData] = useState({})
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListAddColumn])

    const newInvoiceId = useRef(-1)
    const dataSourceRef = useRef([])

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
                    case reqFunction.IMPORT_BY_ID:
                        resultGetInvoiceByID(msg, cltSeqResult, reqInfoMap)
                        break
                    case reqFunction.PRODUCT_IMPORT_INVOICE_CREATE:
                        resultAddProductToInvoice(msg, cltSeqResult, reqInfoMap)
                        break
                    default:
                        return
                }
            }
        })

        if (id !== 0) {
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [id], e => console.log(e), true, handleTimeOut)
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
        return () => {
            importSub.unsubscribe()
        }
    }, [])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
    }

    const resultGetInvoiceByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
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
            setImport(newData.rows[0])
            handleSelectSupplier(newData.rows[0].o_5)
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

    const handleChange = e => {
        const newImport = { ...Import };
        newImport[e.target.name] = e.target.value
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
        if (dataSource.length > 0 && !!Import.supplier && !!Import.order_dt) {
            return false
        }
        return true
    }

    const handleCreateInvoice = () => {
        //bắn event tạo invoice
        const inputParam = [
            !!Import.invoice_no ? Import.invoice_no : 'AUTO',
            Import.supplier,
            moment(Import.order_dt).format('YYYYMMDD'),
            Import.person_s,
            Import.person_r,
            Import.note
        ];
        sendRequest(serviceInfo.GET_INVOICE_BY_ID, inputParam, e => console.log(e), true, handleTimeOut)
    }

    return (
        <Grid container spacing={1}>
            <EditProductRows productEditID={productEditID} productData={productEditData} handleEditProduct={handleEditProduct} />
            <Grid item md={9} xs={12}>
                <div className='d-flex justify-content-between  align-items-center mr-2'>
                    <Link to="/page/order/import" className="normalLink">
                        <Button variant="contained" size="small">
                            {t('btn.back')}
                        </Button>
                    </Link>
                    <ProductImportAdd handleAddProduct={handleAddProduct} />
                </div>

                <div className="d-flex mb-3 mt-3 mr-2">
                    <h6 className="font-weight-bold m-0">{t('order.import.productImportList')}</h6>
                </div>
                {/* table */}
                <Paper className="mr-2">
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
                                        <TableCell nowrap="true"
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
                </Paper>
            </Grid>
            <Grid item md={3} xs={12}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="font-weight-bold m-0">{t('order.import.invoice_info')}</h6>
                </div>
                <Grid container spacing={1}>
                    <TextField
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={1}
                        autoComplete="off"
                        label={t('order.import.invoice_no')}
                        disabled={true}
                        value={Import?.o_2 || ''}
                        name='invoice_no'
                        variant="outlined"
                    />
                    <Supplier_Autocomplete
                        value={supplierSelect || ''}
                        style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                        size={'small'}
                        label={t('menu.supplier')}
                        onSelect={handleSelectSupplier}
                    />
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
                    <NumberFormat
                        style={{ width: '100%' }}
                        required
                        value={dataSource.reduce(function (acc, obj) {
                            return acc + Math.round(obj.qty * obj.price)
                        }, 0) || 0}
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
                        value={dataSource.reduce(function (acc, obj) {
                            return acc + Math.round(obj.discount_per / 100 * (obj.qty * obj.price))
                        }, 0) || 0}
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
                        value={dataSource.reduce(function (acc, obj) {
                            return acc + Math.round(obj.vat_per / 100 * (obj.qty * obj.price))
                        }, 0) || 0}
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
                        value={dataSource.reduce(function (acc, obj) {
                            return acc + Math.round(Math.round(obj.qty * obj.price) - Math.round(obj.discount_per / 100 * (obj.qty * obj.price)) - Math.round(obj.vat_per / 100 * (obj.qty * obj.price)))
                        }, 0) || 0}
                        label={t('order.import.invoice_needpay')}
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
                        label={t('order.import.person_s')}
                        onChange={handleChange}
                        value={Import.person_s || ''}
                        name='person_s'
                        variant="outlined"
                    />
                    <TextField
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={1}
                        autoComplete="off"
                        label={t('order.import.person_r')}
                        onChange={handleChange}
                        value={Import.person_r || ''}
                        name='person_r'
                        variant="outlined"
                    />
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
                        {t('btn.save')}
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default EditImport