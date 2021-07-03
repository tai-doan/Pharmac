import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'menu.product', show: true, disabled: true, minWidth: 200 },
    { field: 'o_5', title: 'menu.configUnit', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'config.price.importPrice', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'config.price.importVAT', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'config.price.price', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'config.price.wholePrice', show: true, disabled: false, minWidth: 100 },
    { field: 'o_10', title: 'config.price.exportVAT', show: true, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'config.price.note', show: true, disabled: false, minWidth: 300 },
    { field: 'o_12', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_13', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_11', title: 'config.unit.titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'price',
    object: 'setupPrice',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.PRICE_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.PRICE_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.PRICE_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.PRICE_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.PRICE_DELETE
    },
}

export {
    tableColumn,
    config
}