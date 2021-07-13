import moment from 'moment'

const tableColumn = [
    { field: 'o_2', title: 'invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'partner.supplier.vender_nm_v', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_4', title: 'order.import.order_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_7', title: 'products.product.name', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'order.import.qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_11', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_12', title: 'order.import.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_13', title: 'order.import.invoice_discount', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.import.invoice_vat', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.import.vals', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_17', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const searchDefaultModal = {
    start_dt: moment().subtract(1, 'months').format('YYYYMMDD'),
    end_dt: moment().format('YYYYMMDD'),
    supplier_id: 0,
    supplier_nm: '',
    invoice_no: '%',
    invoice_status: '%',
    product_id: 0,
    product_nm: '',
    last_invoice_id: 999999999999,
    last_invoice_detail_id: 999999999999
}

export {
    searchDefaultModal,
    tableColumn
}