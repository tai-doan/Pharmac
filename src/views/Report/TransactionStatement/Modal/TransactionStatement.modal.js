import moment from 'moment'

const tableColumn = [
    { field: 'o_2', title: 'menu.product', show: true, disabled: false, minWidth: 200 },
    { field: 'o_3', title: 'report.trans_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_4', title: 'report.s_inven_qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_5', title: 'report.trans_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'report.qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_7', title: 'menu.configUnit', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'report.e_inven_qty', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_9', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const searchDefaultModal = {
    start_dt: moment().subtract(1, 'months').format('YYYYMMDD'),
    end_dt: moment().format('YYYYMMDD'),
    product_id: 0,
    product_nm: '',
    lastID: 999999999999
}

export {
    searchDefaultModal,
    tableColumn
}