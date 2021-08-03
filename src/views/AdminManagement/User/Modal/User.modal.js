import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: false, minWidth: 100 },
    { field: 'o_4', title: 'user.userName', show: true, disabled: false, minWidth: 200 },
    { field: 'o_5', title: 'user.userID', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'user.userActiveStatus', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'user.userEmail', show: true, disabled: false, minWidth: 200 },
    { field: 'o_9', title: 'user.userPhone', show: true, disabled: false, minWidth: 100},
    // { field: 'o_3', title: 'branch', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'createdUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_14', title: 'createdDate', show: true, disabled: false, minWidth: 100, type: 'date' }
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

const defaultUserModalAdd = {
    branch_id: 0,
    username: '',
    user_id: '',
    user_pass: '',
    user_email: '',
    user_phone: ''
}

export {
    defaultUserModalAdd,
    tableColumn,
    config
}