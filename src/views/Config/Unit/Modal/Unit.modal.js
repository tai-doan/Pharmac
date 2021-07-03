import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'config.unit.name', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'config.unit.note', show: true, disabled: false, minWidth: 100 },
    { field: 'o_4', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_6', title: 'config.unit.titleBranch', show: true, disabled: false, minWidth: 100 }
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

export {
    tableColumn,
    config
}