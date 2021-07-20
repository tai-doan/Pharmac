import moment from 'moment';
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    // { field: 'o_3', title: 'settlement.invoice_type', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_4', title: 'settlement.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_6', title: 'settlement.trans_biz_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_8', title: 'settlement.payment_method', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'settlement.payment_date', show: true, disabled: false, minWidth: 200, type: 'dated', align: 'center' },
    { field: 'o_20', title: 'settlement.payment_amount', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_19', title: 'settlement.note', show: true, disabled: false, minWidth: 300 },
    { field: 'o_11', title: 'report.bank_transf_acc_number', show: true, disabled: false, minWidth: 100 },
    { field: 'o_12', title: 'report.bank_transf_acc_name', show: true, disabled: false, minWidth: 100 },
    { field: 'o_14', title: 'report.bank_transf_name', show: true, disabled: false, minWidth: 100 },
    { field: 'o_15', title: 'report.bank_recei_acc_number', show: true, disabled: false, minWidth: 100 },
    { field: 'o_16', title: 'report.bank_recei_acc_name', show: true, disabled: false, minWidth: 100 },
    { field: 'o_18', title: 'report.bank_recei_name', show: true, disabled: false, minWidth: 100 },
    { field: 'o_21', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_22', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'settlement',
    screenName: 'settlement_export_repay',
    object: 'repay_settl',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_REPAY_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_REPAY_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_REPAY_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_REPAY_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.SETTLEMENT_EXPORT_REPAY_DELETE
    },
}

const productExportRepayModal = {
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

const invoiceExportRepayModal = {
    invoice_id: null,
    order_dt: moment().toString(),
    supplier: null,
    invoice_no: '',
    person_s: '',
    person_r: '',
    note: ''
}

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'imp_tp', title: 'order.import.imp_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'prod_nm', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'lot_no', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'exp_dt', title: 'order.import.exp_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'right' },
    { field: 'qty', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
    { field: 'unit_nm', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'price', title: 'order.import.price', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'vat_per', title: 'order.import.vat_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'discount_per', title: 'order.import.discount_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' },
]

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_4', title: 'order.import.imp_tp_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_6', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'order.import.exp_dt', show: true, disabled: true, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_10', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_12', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'order.import.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.import.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.import.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_17', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' }
]

const settlementDefaulModal = {
    settle_id: null,
    invoice_no: '',
    settl_tp: '1',
    settl_tp_nm: '',
    settl_dt: moment().toString(),
    settl_dt_ip: moment().toString(),
    bank_act_s: '',
    bank_act_nm_s: '',
    bank_cd_s: null,
    bank_nm_s: '',
    bank_act_r: '',
    bank_act_nm_r: '',
    bank_cd_r: null,
    bank_nm_r: '',
    note: '',
    settl_amt: null
}

export {
    settlementDefaulModal,
    invoiceExportRepayModal,
    tableListAddColumn,
    tableListEditColumn,
    tableProductInvoiceViewColumn,
    productExportRepayModal,
    tableColumn,
    config
}