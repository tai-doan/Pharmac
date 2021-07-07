import moment from 'moment';
import React from 'react';
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import reqFunction from '../../../../utils/constan/functions';
import Product_Autocomplete from '../../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../../../Config/Unit/Control/Unit.Autocomplete';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.import.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.import.invoice_stat', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_5', title: 'order.import.vender_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'order.import.order_dt', show: true, disabled: false, minWidth: 100, type: 'dated' },
    { field: 'o_7', title: 'order.import.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated' },
    { field: 'o_8', title: 'order.import.person_s', show: true, disabled: false, minWidth: 200 },
    { field: 'o_9', title: 'order.import.person_r', show: true, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'order.import.cancel_reason', show: true, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'order.import.note', show: true, disabled: false, minWidth: 300 },
    { field: 'o_12', title: 'order.import.total_prod', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'order.import.invoice_val', show: true, disabled: false, minWidth: 100 },
    { field: 'o_14', title: 'order.import.invoice_discount', show: true, disabled: false, minWidth: 100 },
    { field: 'o_15', title: 'order.import.invoice_vat', show: true, disabled: false, minWidth: 100 },
    { field: 'o_16', title: 'order.import.invoice_settl', show: true, disabled: false, minWidth: 100 },
    { field: 'o_17', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_18', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' }
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
    prod_name: '',
    lot_no: '',
    made_dt: null,
    exp_dt: null,
    qty: 0,
    unit_id: null,
    unit_name: '',
    price: 0,
    discount_per: 0,
    vat_per: 0
}

export {
    productImportModal,
    tableColumn,
    config
}