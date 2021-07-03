import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'products.productGroup.name', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'products.productGroup.note', show: true, disabled: false, minWidth: 300 },
    { field: 'o_4', title: 'products.productGroup.main_group', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_7', title: 'titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'productGroup',
    object: 'groups',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.PRODUCT_GROUP_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.PRODUCT_GROUP_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.PRODUCT_GROUP_ADD,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.PRODUCT_GROUP_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.PRODUCT_GROUP_DELETE
    },
}

export {
    tableColumn,
    config
}