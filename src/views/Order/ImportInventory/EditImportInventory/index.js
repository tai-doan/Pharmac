import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Button, TextField, Card, CardHeader, CardContent, CardActions, Dialog } from '@material-ui/core'
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

import { tableListEditColumn, invoiceImportInventoryModal } from '../Modal/ImportInventory.modal'
import moment from 'moment'

import { Link } from 'react-router-dom'
import EditProductRows from './EditProductRows'
import AddProductClone from '../AddProductClone'

const serviceInfo = {
    GET_INVOICE_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.IMPORT_BY_ID,
        biz: 'import',
        object: 'imp_inventory'
    },
    GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID: {
        functionName: 'get_all',
        reqFunct: reqFunction.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID,
        biz: 'import',
        object: 'imp_inventory_dt'
    },
    ADD_PRODUCT_TO_INVOICE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
        biz: 'import',
        object: 'imp_inventory_dt'
    },
    DELETE_PRODUCT_TO_INVOICE: {
        functionName: 'delete',
        reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_DELETE,
        biz: 'import',
        object: 'imp_inventory_dt'
    }
}

const EditImportInventory = ({ }) => {
    const { t } = useTranslation()
    const history = useHistory()
    const { id } = history?.location?.state || 0
    const [ImportInventory, setImportInventory] = useState({ ...invoiceImportInventoryModal })
    const [dataSource, setDataSource] = useState([])
    const [productEditID, setProductEditID] = useState(-1)
    const [column, setColumn] = useState([...tableListEditColumn])
    const [productDeleteModal, setProductDeleteModal] = useState({})
    const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false)
    const [deleteProcess, setDeleteProcess] = useState(false)
    const [resetFormAddFlag, setResetFormAddFlag] = useState(false)

    const newInvoiceID = useRef(-1)

    useEffect(() => {
        if (id !== 0) {
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [id], handleResultGetInvoiceByID, true, handleTimeOut)
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID, [id], handleGetAllProductByInvoiceID, true, handleTimeOut)
        }
        return () => {
            history.replace({
                ...history?.location,
                state: undefined,
            });
        }
    }, [])

    const handleResultGetInvoiceByID = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            newInvoiceID.current = newData.rows[0].o_1
            let dataImportInventory = {
                invoice_id: newData.rows[0].o_1,
                invoice_no: newData.rows[0].o_2,
                invoice_stat: newData.rows[0].o_3,
                total_prod: newData.rows[0].o_4,
                total_val: newData.rows[0].o_5,
                cancel_reason: newData.rows[0].o_6,
                note: newData.rows[0].o_7,
                input_dt: moment(newData.rows[0].o_8, 'YYYYMMDD').toString()
            }
            setImportInventory(dataImportInventory)
        }
    }

    const handleGetAllProductByInvoiceID = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
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

    const handleAddProduct = productObject => {
        if (!productObject) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        const inputParam = [
            ImportInventory.invoice_id || newInvoiceID.current,
            productObject.prod_id,
            productObject.lot_no.toUpperCase(),
            productObject.unit_id,
            productObject.qty,
            productObject.made_dt ? moment(productObject.made_dt).format('YYYYMMDD') : '',
            productObject.exp_dt ? moment(productObject.exp_dt).format('YYYYMMDD') : '',
            productObject.price,
        ]
        sendRequest(serviceInfo.ADD_PRODUCT_TO_INVOICE, inputParam, handleResultAddProduct, true, handleTimeOut)
    }

    const handleResultAddProduct = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_CODE'] !== 'SYS000') {
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
            sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID, [newInvoiceID.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
            sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceID.current], handleResultGetInvoiceByID, true, handleTimeOut)
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
        if (!productDeleteModal.o_1 || !productDeleteModal.o_2) return
        setDeleteProcess(true)
        const inputParam = [productDeleteModal.o_2, productDeleteModal.o_1];
        sendRequest(serviceInfo.DELETE_PRODUCT_TO_INVOICE, inputParam, handleResultDeleteProduct, true, handleTimeOut)
    }

    const handleResultDeleteProduct = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setDeleteProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            setProductDeleteModal({})
            setShouldOpenDeleteModal(false)
            handleRefresh()
        }
    }

    const checkValidate = () => {
        console.log(dataSource, ImportInventory)
        if (dataSource.length > 0 && !!ImportInventory.supplier && !!ImportInventory.order_dt) {
            return false
        }
        return true
    }

    const onDoubleClickRow = rowData => {
        if (!rowData) {
            SnackBarService.alert(t('wrongData'), true, 'error', 3000)
            return
        }
        setProductEditID(rowData.o_1)
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID, [newInvoiceID.current], handleGetAllProductByInvoiceID, true, handleTimeOut)
        sendRequest(serviceInfo.GET_INVOICE_BY_ID, [newInvoiceID.current], handleResultGetInvoiceByID, true, handleTimeOut)
    }

    return (
        <Grid container spacing={1}>
            <EditProductRows productEditID={productEditID} invoiceID={newInvoiceID.current} onRefresh={handleRefresh} setProductEditID={setProductEditID} />
            <Grid item md={9} xs={12}>
                <AddProductClone onAddProduct={handleAddProduct} resetFlag={resetFormAddFlag} />
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
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('order.import.invoice_no')}
                                disabled={true}
                                value={ImportInventory.invoice_no || ''}
                                name='invoice_no'
                                variant="outlined"
                            />
                            <NumberFormat className='inputNumber'
                                style={{ width: '100%' }}
                                required
                                value={dataSource.reduce(function (acc, obj) {
                                    return acc + Math.round(obj.o_8 * obj.o_11)
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
                            <TextField
                                disabled={true}
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                rows={2}
                                rowsMax={5}
                                label={t('order.import.note')}
                                value={ImportInventory.note || ''}
                                name='note'
                                variant="outlined"
                            />
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

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
                        <Grid container>{productDeleteModal.o_4}</Grid>
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

export default EditImportInventory