const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: false, minWidth: 100 },
    { field: 'o_2', title: 'lockOrder.invoice_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_4', title: 'lockOrder.lock_tp_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_5', title: 'lockOrder.inv_auto', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'createdUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'createdDate', show: true, disabled: false, minWidth: 100, type: 'date' }
]

export {
    tableColumn
}