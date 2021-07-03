import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'menu.product', show: true, disabled: true, minWidth: 100 },
    { field: 'o_5', title: 'menu.configUnit', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'config.unitRate.rate', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'config.unitRate.minRate', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_10', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_11', title: 'config.unit.titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'unit-rate',
    object: 'units_cvt',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.UNIT_RATE_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.UNIT_RATE_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.UNIT_RATE_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.UNIT_RATE_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.UNIT_RATE_DELETE
    },
}

export {
    tableColumn,
    config
}