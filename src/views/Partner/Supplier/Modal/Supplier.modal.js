import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'partner.supplier.vender_nm_v', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'partner.supplier.vender_nm_e', show: true, disabled: false, minWidth: 200 },
    { field: 'o_4', title: 'partner.supplier.vender_nm_short', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'partner.supplier.address', show: true, disabled: false, minWidth: 300 },
    { field: 'o_6', title: 'partner.supplier.phone', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'partner.supplier.fax', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'partner.supplier.email', show: true, disabled: false, minWidth: 100 },
    { field: 'o_9', title: 'partner.supplier.website', show: true, disabled: false, minWidth: 300 },
    { field: 'o_10', title: 'partner.supplier.tax_cd', show: true, disabled: false, minWidth: 200 },
    { field: 'o_11', title: 'partner.supplier.bank_acnt_no', show: true, disabled: false, minWidth: 200 },
    { field: 'o_12', title: 'partner.supplier.bank_acnt_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_14', title: 'partner.supplier.bank_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_15', title: 'partner.supplier.agent_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_16', title: 'partner.supplier.agent_fun', show: true, disabled: false, minWidth: 100 },
    { field: 'o_17', title: 'partner.supplier.agent_address', show: true, disabled: false, minWidth: 300 },
    { field: 'o_18', title: 'partner.supplier.agent_phone', show: true, disabled: false, minWidth: 100 },
    { field: 'o_19', title: 'partner.supplier.agent_email', show: true, disabled: false, minWidth: 100 },
    { field: 'o_22', title: 'partner.supplier.default_yn', show: true, disabled: false, minWidth: 300 },
    { field: 'o_20', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_21', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_11', title: 'partner.unit.titleBranch', show: true, disabled: false, minWidth: 100 }
]

const config = {
    biz: 'import',
    moduleName: 'common',
    screenName: 'suppliers',
    object: 'venders',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.SUPPLIER_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.SUPPLIER_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.SUPPLIER_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.SUPPLIER_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.SUPPLIER_DELETE
    },
}

const defaultModalAdd = {
    vender_nm_v: '',
    vender_nm_e: '',
    vender_nm_short: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    tax_cd: '',
    bank_acnt_no: '',
    bank_acnt_nm: '',
    bank_cd: '',
    agent_nm: '',
    agent_fun: '',
    agent_address: '',
    agent_phone: '',
    agent_email: '',
    default_yn: 'Y'
}

export {
    defaultModalAdd,
    tableColumn,
    config
}