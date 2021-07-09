import moment from 'moment';
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.import.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.import.invoice_stat', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_4', title: 'order.import.total_prod', show: true, disabled: false, minWidth: 200, type: 'number', align: 'right' },
    { field: 'o_5', title: 'order.import.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_6', title: 'order.import.cancel_reason', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.note', show: true, disabled: false, minWidth: 300 },
    { field: 'o_8', title: 'order.import.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_9', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'import',
    screenName: 'import_inventory',
    object: 'imp_inventory',
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

export {
    productImportModal,
    tableColumn,
    config
}