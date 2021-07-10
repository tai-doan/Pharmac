import moment from 'moment'
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.export.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.export.invoice_stat_nm', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_5', title: 'order.export.cust_nm_v', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'order.export.order_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_7', title: 'order.export.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_8', title: 'order.export.staff_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_9', title: 'order.export.cancel_reason', show: true, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'order.export.note', show: true, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'order.export.total_prod', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_12', title: 'order.export.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_13', title: 'order.export.invoice_discount', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.export.invoice_vat', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.export.invoice_settl', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_17', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'export',
    screenName: 'export',
    object: 'exp_invoices',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.EXPORT_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.EXPORT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.EXPORT_DELETE
    },
}

const productExportModal = {
    invoice_id: '',
    exp_tp: '1',
    exp_tp_nm: '',
    prod_id: null,
    prod_nm: '',
    lot_no: '',
    qty: 0,
    unit_id: null,
    unit_nm: '',
    price: 0,
    discount_per: 0,
    vat_per: 0
}

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'exp_tp', title: 'order.export.exp_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'prod_nm', title: 'order.export.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'lot_no', title: 'order.export.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'qty', title: 'order.export.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
    { field: 'unit_nm', title: 'order.export.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'price', title: 'order.export.price', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'vat_per', title: 'order.export.vat_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'discount_per', title: 'order.export.discount_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' },
]

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_3', title: 'order.export.exp_tp_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_5', title: 'order.export.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'order.export.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.export.qty', show: true, disabled: true, minWidth: 100, type: 'number', align: 'center' },
    { field: 'o_9', title: 'order.export.unit_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_10', title: 'order.export.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_11', title: 'order.export.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_12', title: 'order.export.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_13', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_14', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' }
]

const invoiceExportModal = {
    invoice_id: null,
    order_dt: moment().toString(),
    customer: null,
    invoice_no: '',
    staff_exp: '',
    note: ''
}

export {
    invoiceExportModal,
    tableListAddColumn,
    tableListEditColumn,
    productExportModal,
    tableColumn,
    config
}