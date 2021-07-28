import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'menu.product', show: true, disabled: true, minWidth: 200 },
    { field: 'o_5', title: 'menu.configUnit', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'config.store_limit.minQuantity', show: true, disabled: false, minWidth: 100, type:'number', align: 'right' },
    { field: 'o_7', title: 'config.store_limit.maxQuantity', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_8', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'storeLimit',
    object: 'store_limit',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.STORE_LIMIT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.STORE_LIMIT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.STORE_LIMIT_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.STORE_LIMIT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.STORE_LIMIT_DELETE
    },
}

const modalDefaultAdd = {
    product: null,
    unit: null,
    minQuantity: 0,
    maxQuantity: 0
}

export {
    modalDefaultAdd,
    tableColumn,
    config
}