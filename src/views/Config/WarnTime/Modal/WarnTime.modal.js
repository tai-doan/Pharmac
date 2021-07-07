import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'menu.product', show: true, disabled: true, minWidth: 100 },
    { field: 'o_4', title: 'config.warnTime.warn_amt', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'config.warnTime.warn_time_tp', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_9', title: 'titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'warn-time',
    object: 'conf_expiredt',
    list: {
        functionName: 'get_all',
        reqFunct: reqFunction.WARN_TIME_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.WARN_TIME_BY_ID,
    },
    insert: {
        functionName: 'insert',
        reqFunct: reqFunction.WARN_TIME_CREATE,
    },
    update: {
        functionName: 'update',
        reqFunct: reqFunction.WARN_TIME_UPDATE,
    },
    delete: {
        functionName: 'delete',
        reqFunct: reqFunction.WARN_TIME_DELETE
    },
}

export {
    tableColumn,
    config
}