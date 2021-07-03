import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'menu.productGroup', show: true, disabled: true, minWidth: 200 },
    { field: 'o_4', title: 'products.product.code', show: true, disabled: true, minWidth: 100 },
    { field: 'o_5', title: 'products.product.name', show: true, disabled: true, minWidth: 200 },
    { field: 'o_6', title: 'products.product.barcode', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'products.product.content', show: true, disabled: false, minWidth: 300 },
    { field: 'o_8', title: 'products.product.contraind', show: true, disabled: false, minWidth: 300 },
    { field: 'o_9', title: 'products.product.designate', show: true, disabled: false, minWidth: 300 },
    { field: 'o_10', title: 'products.product.dosage', show: true, disabled: false, minWidth: 300 },
    { field: 'o_11', title: 'products.product.interact', show: true, disabled: false, minWidth: 300 },
    { field: 'o_12', title: 'products.product.manufact', show: true, disabled: false, minWidth: 300 },
    { field: 'o_13', title: 'products.product.effect', show: true, disabled: false, minWidth: 300 },
    { field: 'o_14', title: 'products.product.overdose', show: true, disabled: false, minWidth: 300 },
    { field: 'o_15', title: 'products.product.packing', show: true, disabled: false, minWidth: 300 },
    { field: 'o_16', title: 'products.product.storages', show: true, disabled: false, minWidth: 300 },
    { field: 'o_18', title: 'menu.configUnit', show: true, disabled: false, minWidth: 200 },
    { field: 'o_19', title: 'createdUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_20', title: 'createdDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_21', title: 'titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'product',
    object: 'products',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.PRODUCT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.PRODUCT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.PRODUCT_ADD,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.PRODUCT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.PRODUCT_DELETE
    },
}

export {
    tableColumn,
    config
}