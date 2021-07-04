import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'partner.customer.cust_nm_v', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'partner.customer.cust_nm_e', show: true, disabled: false, minWidth: 200 },
    { field: 'o_4', title: 'partner.customer.cust_nm_short', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'partner.customer.address', show: true, disabled: false, minWidth: 300 },
    { field: 'o_6', title: 'partner.customer.phone', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'partner.customer.fax', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'partner.customer.email', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'partner.customer.website', show: true, disabled: false, minWidth: 300 },
    { field: 'o_10', title: 'partner.customer.tax_cd', show: true, disabled: true, minWidth: 200 },
    { field: 'o_11', title: 'partner.customer.bank_acnt_no', show: true, disabled: false, minWidth: 200 },
    { field: 'o_12', title: 'partner.customer.bank_acnt_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_14', title: 'partner.customer.bank_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_15', title: 'partner.customer.agent_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_16', title: 'partner.customer.agent_fun', show: true, disabled: false, minWidth: 100 },
    { field: 'o_17', title: 'partner.customer.agent_address', show: true, disabled: false, minWidth: 300 },
    { field: 'o_18', title: 'partner.customer.agent_phone', show: true, disabled: false, minWidth: 100 },
    { field: 'o_19', title: 'partner.customer.agent_email', show: true, disabled: false, minWidth: 100 },
    { field: 'o_22', title: 'partner.customer.default_yn', show: true, disabled: false, minWidth: 300 },
    { field: 'o_20', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_21', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_11', title: 'partner.unit.titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'export',
    moduleName: 'common',
    screenName: 'customers',
    object: 'customers',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.CUSTOMER_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.CUSTOMER_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.CUSTOMER_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.CUSTOMER_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.CUSTOMER_DELETE
    },
}

export {
    tableColumn,
    config
}