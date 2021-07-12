import moment from 'moment'
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.exportDestroy.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.exportDestroy.invoice_stat_nm', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_4', title: 'order.exportDestroy.exp_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_5', title: 'order.exportDestroy.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_6', title: 'order.exportDestroy.staff_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_7', title: 'order.exportDestroy.note', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'order.exportDestroy.total_prod', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_9', title: 'order.exportDestroy.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_10', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_11', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'export',
    screenName: 'exportDestroy',
    object: 'exp_destroy',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_DESTROY_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_DESTROY_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.EXPORT_DESTROY_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.EXPORT_DESTROY_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.EXPORT_DESTROY_DELETE
    },
}

const productExportDestroyModal = {
    invoice_id: '',
    prod_id: null,
    prod_nm: '',
    lot_no: '',
    qty: 0,
    unit_id: null,
    unit_nm: '',
    price: 0,
    reason_tp: '1',
    uantity_in_stock: null
}

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'prod_nm', title: 'order.exportDestroy.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'lot_no', title: 'order.exportDestroy.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'qty', title: 'order.exportDestroy.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
    { field: 'unit_nm', title: 'order.exportDestroy.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'price', title: 'order.exportDestroy.price', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'reason_tp', title: 'order.exportDestroy.reason_tp', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' },
]

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_4', title: 'order.exportDestroy.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'order.exportDestroy.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'order.exportDestroy.qty', show: true, disabled: true, minWidth: 100, type: 'number', align: 'center' },
    { field: 'o_8', title: 'order.exportDestroy.unit_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_9', title: 'order.exportDestroy.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_10', title: 'order.exportDestroy.reason_tp', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' }
]

const invoiceExportDestroyModal = {
    invoice_id: null,
    exp_dt: moment().toString(),
    invoice_no: '',
    staff_exp: '',
    note: ''
}

export {
    invoiceExportDestroyModal,
    tableListAddColumn,
    tableListEditColumn,
    productExportDestroyModal,
    tableColumn,
    config
}