import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: false, minWidth: 100 },
    { field: 'o_2', title: 'pharmacy.pharmacyName', show: true, disabled: false, minWidth: 200 },
    { field: 'o_4', title: 'pharmacy.approve_status', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'pharmacy.address', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'pharmacy.licence', show: true, disabled: false, minWidth: 200 },
    { field: 'o_7', title: 'pharmacy.licence_dt', show: true, disabled: false, minWidth: 100, type: 'dated'},
    { field: 'o_8', title: 'pharmacy.licence_pl', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'pharmacy.boss_name', show: true, disabled: false, minWidth: 100 },
    { field: 'o_10', title: 'pharmacy.boss_phone', show: true, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'pharmacy.boss_email', show: true, disabled: false, minWidth: 100 },
    // { field: 'o_13', title: 'createdUser', show: true, disabled: false, minWidth: 100 },
    // { field: 'o_14', title: 'createdDate', show: true, disabled: false, minWidth: 100, type: 'date' }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'unit',
    object: 'units',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.GET_UNIT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.GET_UNIT,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.INS_UNIT,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.MOD_UNIT,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.DEL_UNIT
    },
}

const defaultPharmacyModalAdd = {
    branch_id: 0,
    username: '',
    user_id: '',
    user_pass: '',
    user_email: '',
    user_phone: ''
}

export {
    defaultPharmacyModalAdd,
    tableColumn,
    config
}