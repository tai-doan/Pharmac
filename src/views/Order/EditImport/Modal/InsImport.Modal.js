import moment from 'moment';

const productImportModal = {
    invoice_id: '',
    imp_tp: 'Y',
    imp_tp_nm: '',
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

const invoiceImportModal = {
    order_dt: moment().toString(),
    supplier: null,
    invoice_no: '',
    person_s: '',
    person_r: '',
    note: ''
}

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100 },
    { field: 'o_4', title: 'order.ins_import.imp_tp_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_6', title: 'order.ins_import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.ins_import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'order.ins_import.exp_dt', show: true, disabled: true, minWidth: 100, type: 'dated' },
    { field: 'o_10', title: 'order.ins_import.qty', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_12', title: 'order.ins_import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'order.ins_import.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.ins_import.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.ins_import.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_17', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
]

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'imp_tp', title: 'order.ins_import.imp_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'prod_nm', title: 'order.ins_import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'lot_no', title: 'order.ins_import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'exp_dt', title: 'order.ins_import.exp_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'right' },
    { field: 'qty', title: 'order.ins_import.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
    { field: 'unit_nm', title: 'order.ins_import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'price', title: 'order.ins_import.price', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'vat_per', title: 'order.ins_import.vat_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'discount_per', title: 'order.ins_import.discount_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'action', title: 'btn.delete', show: true, disabled: false, minWidth: 100, align: 'center' },
]

export {
    tableListAddColumn,
    tableListEditColumn,
    invoiceImportModal,
    productImportModal
}