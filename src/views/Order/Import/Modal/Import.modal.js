import moment from 'moment';
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.import.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.import.invoice_stat', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_5', title: 'order.import.vender_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'order.import.order_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_7', title: 'order.import.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    // { field: 'o_8', title: 'order.import.person_s', show: true, disabled: false, minWidth: 200 },
    // { field: 'o_9', title: 'order.import.person_r', show: true, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'order.import.cancel_reason', show: false, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'order.import.note', show: false, disabled: false, minWidth: 300 },
    { field: 'o_12', title: 'order.import.total_prod', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_13', title: 'order.import.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.import.invoice_discount', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.import.invoice_vat', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'order.import.invoice_settl', show: false, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_17', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_18', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'import',
    screenName: 'import',
    object: 'imp_invoices',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.IMPORT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.IMPORT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.IMPORT_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.IMPORT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.IMPORT_DELETE
    },
}

const productImportModal = {
    invoice_id: '',
    imp_tp: '1',
    prod_id: null,
    prod_nm: '',
    lot_no: '',
    made_dt: moment().format('YYYYMMDD'),
    exp_dt: null,
    qty: 0,
    unit_id: null,
    unit_nm: '',
    price: 0,
    discount_per: 0,
    vat_per: 0
}

const tableProductInvoiceViewColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100 },
    { field: 'o_4', title: 'order.import.imp_tp_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_6', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'order.import.exp_dt', show: true, disabled: true, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_10', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_12', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'order.import.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.import.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.import.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date', align: 'center' },
    { field: 'o_17', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const invoiceImportModal = {
    invoice_id: null,
    order_dt: moment().toString(),
    supplier: null,
    invoice_no: '',
    person_s: '',
    person_r: '',
    note: '',
    payment_type: '1',
    payment_amount: 0,
    invoice_settl: 0,
    invoice_val: 0,
    invoice_vat: 0,
    invoice_discount: 0,
    bank_transf_name: null,
    bank_transf_name_s: '',
    bank_transf_acc_name: '',
    bank_transf_acc_number: '',
    bank_recei_name: null,
    bank_recei_name_s: '',
    bank_recei_acc_name: '',
    bank_recei_acc_number: ''
}

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_4', title: 'order.import.imp_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100, className: 'uppercase' },
    { field: 'o_9', title: 'order.import.exp_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'right' },
    { field: 'o_10', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
    { field: 'o_12', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'order.import.price', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'o_15', title: 'order.import.discount_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'o_14', title: 'order.import.vat_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' },
]

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_4', title: 'order.import.imp_tp_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_6', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100, className: 'uppercase' },
    { field: 'o_9', title: 'order.import.exp_dt', show: true, disabled: true, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_10', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_12', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'order.import.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.import.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.import.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    // { field: 'o_16', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_17', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' },
]

export {
    invoiceImportModal,
    tableListAddColumn,
    tableListEditColumn,
    tableProductInvoiceViewColumn,
    productImportModal,
    tableColumn,
    config
}