
const tableColumn = [
    { field: 'o_2', title: 'products.product.name', show: true, disabled: false, minWidth: 200 },
    { field: 'o_3', title: 'report.lot_no', show: true, disabled: true, minWidth: 100 },
    { field: 'o_5', title: 'report.inven_qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_6', title: 'report.imp_qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_7', title: 'report.exp_qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_8', title: 'report.exp_qty_rp', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_9', title: 'report.exp_qty_cacl', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' }
]

const searchDefaultModal = {
    group_id: null,
    group_nm: '',
    lot_no: '',
    invent_yn: 'Y',
    last_product_id: 999999999999,
    last_lot_no_id: 'ZZZ'
}

export {
    searchDefaultModal,
    tableColumn
}