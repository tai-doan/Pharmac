import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import NumberFormat from 'react-number-format'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { Grid } from '@material-ui/core'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import Supplier_Autocomplete from '../../Partner/Supplier/Control/Supplier.Autocomplete'
import { config, tableProductInvoiceViewColumn } from './Modal/Import.modal'
import { requestInfo } from '../../../utils/models/requestInfo'
import moment from 'moment'

const serviceInfo = {
    GET_IMPORT_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    },
    GET_LIST_PRODUCT_INVOICE: {
        functionName: 'get_all',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID,
        biz: 'import',
        object: 'imp_invoices_dt'
    }
}

const ImportView = ({ id, shouldOpenViewModal, handleCloseViewModal }) => {
    const { t } = useTranslation()

    const [Import, setImport] = useState({})
    const [listProductInvoice, setListProductInvoice] = useState([])
    const [columnListProduct, setColumnListProduct] = useState([...tableProductInvoiceViewColumn])

    useEffect(() => {
        const ImportSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.IMPORT_BY_ID) {
                    resultGetImportByID(msg, cltSeqResult, reqInfoMap)
                }
                if (reqInfoMap.reqFunct === reqFunction.PRODUCT_IMPORT_INVOICE_BY_ID) {
                    resultGetProductImportByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            ImportSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            setImport({})
            setListProductInvoice([])
            sendRequest(serviceInfo.GET_IMPORT_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
            sendRequest(serviceInfo.GET_LIST_PRODUCT_INVOICE, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetImportByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            let dataConvert = newData.rows[0]
            dataConvert.o_6 = moment(dataConvert.o_6).toString();
            dataConvert.o_7 = moment(dataConvert.o_7).toString();
            setImport(dataConvert)
        }
    }

    const resultGetProductImportByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setListProductInvoice(newData.rows)
        }
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="lg"
            open={shouldOpenViewModal}
            onClose={e => {
                handleCloseViewModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('order.import.titleView', { name: Import.o_2 })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.invoice_no')}
                            value={Import.o_2 || ''}
                            name='o_2'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.invoice_stat')}
                            value={Import.o_3 === '1' ? t('normal') : t('cancelled')}
                            name='o_3'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Supplier_Autocomplete
                            disabled={true}
                            value={Import.o_5}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.supplier')}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disabled={true}
                                disableToolbar
                                margin="dense"
                                variant="inline"
                                inputVariant="outlined"
                                style={{ width: '100%' }}
                                format="dd/MM/yyyy"
                                id="order_dt-picker-inline"
                                label={t('order.import.order_dt')}
                                value={Import.o_6 || new Date()}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disabled={true}
                                disableToolbar
                                margin="dense"
                                variant="inline"
                                format="dd/MM/yyyy"
                                inputVariant="outlined"
                                style={{ width: '100%' }}
                                id="input_dt-picker-inline"
                                label={t('order.import.input_dt')}
                                value={Import.o_7 || new Date()}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.person_s')}
                            value={Import.o_8 || ''}
                            name='o_8'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.person_r')}
                            value={Import.o_9 || ''}
                            name='o_9'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Import.o_12}
                            label={t('order.import.total_prod')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Import.o_13}
                            label={t('order.import.invoice_val')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Import.o_14}
                            label={t('order.import.invoice_discount')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Import.o_15}
                            label={t('order.import.invoice_vat')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <NumberFormat
                            disabled={true}
                            style={{ width: '100%' }}
                            required
                            value={Import.o_16}
                            label={t('order.import.invoice_settl')}
                            customInput={TextField}
                            autoComplete="off"
                            margin="dense"
                            type="text"
                            variant="outlined"
                            thousandSeparator={true}
                            inputProps={{
                                min: 0,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('createdUser')}
                            value={Import.o_17}
                            name="o_17"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('createdDate')}
                            value={moment(Import.o_18, 'DDMMYYYYHHmmss').format('DD/MM/YYYY HH:mm:ss')}
                            name="o_18"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <TextField
                            disabled={true}
                            fullWidth={true}
                            margin="dense"
                            multiline
                            autoComplete="off"
                            label={t('order.import.note')}
                            value={Import.o_11 || ''}
                            name='o_11'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <TableContainer className="tableContainer">
                        <Table stickyHeader>
                            <caption
                                className={['text-center text-danger border-bottom', listProductInvoice?.length > 0 ? 'd-none' : ''].join(
                                    ' '
                                )}
                            >
                                {t('lbl.emptyData')}
                            </caption>
                            <TableHead>
                                <TableRow>
                                    {columnListProduct?.map(col => (
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
                                {listProductInvoice?.map((item, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            {columnListProduct.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        case 'stt':
                                                            return (
                                                                <TableCell nowrap="true" nowrap="true" key={indexRow} align={col.align}>
                                                                    {index + 1}
                                                                </TableCell>
                                                            )
                                                        case 'o_3':
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
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseViewModal(false);
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ImportView