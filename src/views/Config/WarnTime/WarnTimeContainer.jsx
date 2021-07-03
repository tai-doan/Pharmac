import {
    compose,
    withHandlers,
    withState,
    // withProps,
    // defaultProps,
    // hoistStatics,
    lifecycle
} from "recompose";

import { withTranslation } from 'react-i18next';

import WarnTimeView from "./WarnTimeView";
import SnackBarService from '../../../utils/service/snackbar_service';

import glb_sv from "../../../utils/service/global_service";
import socket_sv from "../../../utils/service/socket_service";
import { inputPrmRq } from "../../../utils/models/inputPrmRq";
import { requestInfo } from "../../../utils/models/requestInfo";
/**
 * Nguyên tắc trình tự giao tiếp giữa client với server
 * bước 1: Kiểm tra cờ trạng thái function đang xử lý hay không (nhằm tránh xử lý double), nếu đang xử lý -> return
 * bước 2: Kiểm tra tính hợp lệ của các dự liệu input
 * bước 3: Sinh "client Sequence" (số thứ tự yêu cầu của request), sau đó tạo một đối tượng (model: inputPrmRq) tham số gửi tới server
 * bước 4: Tạo một đối tượng (model: requestInfo) chứa nội dung request và sẽ được lưu vào Map (global) với  key là "client Sequence" ở bước 3
 * bước 5: Gửi request xuống server, đồng thời bật bộ đếm để callback hàm control timeout (trong trường hợp không nhận được phản hồi từ server)
 * bước 6: Các Xử lý khi nhận được phản hồi từ server: 1 - clear đối tường control timeout (ở bước 5) và xét cờ trạng thái về false,
 *          trạng thái xử lý của model request về - xử lý xong ngay lập tức
 * bước 7: Các xử lý nếu timeout xảy ra: Xét
 */

//-- Khai báo cac biến của một hàm Product ở đây
let product_SendReqFlag = false; //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let product_ProcTimeOut; //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv; //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let onChangeEvTimeoutDelay // xử lý debounce event Onchange Input
//-- function subcrible event that server result

const subscrFunction = (props) => {

    subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe(message => {

        if (message) {
            const cltSeqResult = message['REQUEST_SEQ'];
            if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) { return; }
            const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult);
            glb_sv.logMessage('reqInfoMap result: ' + JSON.stringify(reqInfoMap));
            if (reqInfoMap == null || reqInfoMap === undefined) { return; }
            switch (reqInfoMap.reqFunct) {
                case glb_sv.warn_time_default_FcntNm:
                    resultGetTimeDefault(props, message, cltSeqResult, reqInfoMap);
                    getList(props, '');
                    break;
                case glb_sv.warn_time_default_edit_FcntNm:
                    resultSubmitTimeDefault(props, message, cltSeqResult, reqInfoMap);
                    break;
                case glb_sv.product_FcntNm:
                    resultGetListProduct(props, message, cltSeqResult, reqInfoMap);
                    getListUnit(props);
                    break;
                case glb_sv.unit_warn_time_FcntNm:
                    resultGetListUnit(props, message, cltSeqResult, reqInfoMap);
                    break;
                case glb_sv.warn_time_FcntNm:
                    resultGetList(props, message, cltSeqResult, reqInfoMap);
                    getListProduct(props, '');
                    break;
                case glb_sv.warn_time_ins_FcntNm:
                case glb_sv.warn_time_edit_FcntNm:
                    resultSubmit(props, message, cltSeqResult, reqInfoMap);
                    break;
                case glb_sv.warn_time_del_FcntNm:
                    resultRemove(props, message, cltSeqResult, reqInfoMap);
                    break;

                default:
                    return;
            }

        }
    });
}

//-- gửi request xuống server --
const getTimeDefault = (props) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }
    const clientSeq = socket_sv.getClientSeq();
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config['time_default'].moduleName;
    svInputPrm.screenName = config['time_default'].screenName;
    svInputPrm.functionName = config['time_default']['get'].functionName;
    svInputPrm.operation = config['time_default']['get'].operation;
    svInputPrm.inputPrm = [];
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config['time_default']['get'].reqFunct;
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );
}

const resultGetTimeDefault = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false;
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }

    let data = message['PROC_DATA'];
    if (data.length > 0) {
        data = data[0];
        props.setTimeDefault(data.warn_amt)
        props.setUnitTimeDefault(data.warn_time_tp);
    }
}


const onSubmitTimeDefault = (props, data, type) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }

    const clientSeq = socket_sv.getClientSeq();
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config['time_default'].moduleName;
    svInputPrm.screenName = config['time_default'].screenName;
    svInputPrm.functionName = config['time_default']['edit'].functionName;
    svInputPrm.operation = config['time_default']['edit'].operation;
    svInputPrm.inputPrm = data;

    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config['time_default']['edit'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );
}

const resultSubmitTimeDefault = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
}

//-- gửi request xuống server --
const getList = (props, valueSearch, action = '') => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }
    const clientSeq = socket_sv.getClientSeq();
    let nextSeq = props.data.length == 0 ? 9999999999 : props.data[props.data.length - 1]['id']
    if (action === 'reload') {
        nextSeq = 9999999999;
        props.setData([])
    }
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config.moduleName;
    svInputPrm.screenName = config.screenName;
    svInputPrm.functionName = config['list'].functionName;
    svInputPrm.operation = config['list'].operation;
    svInputPrm.inputPrm = [
        valueSearch,
        nextSeq
    ];
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config['list'].reqFunct;
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );
}

const resultGetList = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false;
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }
    let newData = !!props.data ? props.data : []
    newData = newData.concat(message['PROC_DATA'])
    props.setData(newData)
    if (newData.length > 0) {
        props.setTotalRecords(newData[0]['total'])
    }
    // props.setData(message['PROC_DATA'])
}

const getListProduct = (props, valueSearch, action = '') => {
    const { t } = props

    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }
    const clientSeq = socket_sv.getClientSeq();
    let nextSeq = props.dataProduct.length == 0 ? 9999999999 : props.dataProduct[props.dataProduct.length - 1]['id']
    if (action === 'reload') {
        nextSeq = 9999999999;
        props.setDataProduct([])
    }
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config['list_product'].moduleName;
    svInputPrm.screenName = config['list_product'].screenName;
    svInputPrm.functionName = config['list_product'].functionName;
    svInputPrm.operation = config['list_product'].operation;
    svInputPrm.inputPrm = [
        valueSearch,
        nextSeq
    ];
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config['list_product'].reqFunct;
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );


}

const resultGetListProduct = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false;
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }

    props.setDataProduct(message['PROC_DATA'])
}


const getListUnit = (props) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }
    const clientSeq = socket_sv.getClientSeq();
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config['list_unit'].moduleName;
    svInputPrm.screenName = config['list_unit'].screenName;
    svInputPrm.functionName = config['list_unit'].functionName;
    svInputPrm.operation = config['list_unit'].operation;
    svInputPrm.inputPrm = ['warn_time_tp'];
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config['list_unit'].reqFunct;
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );
}

const resultGetListUnit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false;
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }

    props.setDataUnit(message['PROC_DATA'])
}



const onSubmit = (props, data, type) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }

    const clientSeq = socket_sv.getClientSeq();
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config.moduleName;
    svInputPrm.screenName = config.screenName;
    svInputPrm.functionName = config[type].functionName;
    svInputPrm.operation = config[type].operation;
    svInputPrm.inputPrm = data;

    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config[type].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );
}

const resultSubmit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)

    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false;
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    } else {
        getList(props, '%', 'reload')
    }

    props.setOpenDialogIns(false)
}

const onRemove = (props, id) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return;
    } else {
        product_SendReqFlag = true; //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return;
    }
    const clientSeq = socket_sv.getClientSeq();
    // -- send requst to server
    const svInputPrm = new inputPrmRq();
    svInputPrm.clientSeq = clientSeq;
    svInputPrm.moduleName = config.moduleName;
    svInputPrm.screenName = config.screenName;
    svInputPrm.functionName = config['del'].functionName;
    svInputPrm.operation = config['del'].operation;
    svInputPrm.inputPrm = [id];

    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm);
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = config['del'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(
        solving_TimeOut,
        glb_sv.timeoutNumber,
        props,
        clientSeq
    );
}

const resultRemove = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut);
    product_SendReqFlag = false;
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    reqInfoMap.procStat = 2;
    SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)

    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false;
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    } else {
        getList(props, '%', 'reload')
    }

    props.setOpenDialogRemove(false)
}


//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {
    if (cltSeq == null || cltSeq === undefined || isNaN(cltSeq)) { return; }
    const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    if (reqIfMap == null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    reqIfMap.resTime = new Date();
    reqIfMap.procStat = 4;
    glb_sv.setReqInfoMapValue(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === glb_sv.Product_FunctNm) {
        product_SendReqFlag = false;
    }
    const { t } = props;
    SnackBarService.alert(t('message.noReceiveFeedback'), true, 4,3000)
}

const config = {
    moduleName: 'import',
    screenName: 'warning-time',
    time_default: {
        moduleName: 'import',
        screenName: 'warning-time-default',
        get: {
            functionName: 'get_bid',
            operation: 'Q',
            reqFunct: glb_sv.warn_time_default_FcntNm
        },
        edit: {
            functionName: 'upd',
            operation: 'U',
            reqFunct: glb_sv.warn_time_default_edit_FcntNm
        }
    },
    list_product: {
        moduleName: 'common',
        screenName: 'prod',
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: glb_sv.product_FcntNm
    },
    list_unit: {
        moduleName: 'common',
        screenName: 'com-info',
        functionName: 'get_dict_info_ddw_list',
        operation: 'Q',
        reqFunct: glb_sv.unit_warn_time_FcntNm
    },
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: glb_sv.warn_time_FcntNm
    },
    ins: {
        functionName: 'ins',
        operation: 'I',
        reqFunct: glb_sv.warn_time_ins_FcntNm
    },
    edit: {
        functionName: 'upd',
        operation: 'U',
        reqFunct: glb_sv.warn_time_edit_FcntNm
    },
    del: {
        functionName: 'del',
        operation: 'D',
        reqFunct: glb_sv.warn_time_del_FcntNm
    }
}

const tableCols = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true },
    { field: 'prod_nm', title: 'config.warnTime.productName', show: true, disabled: true },
    { field: 'warn_amt', title: 'config.warnTime.time', show: true, disabled: false },
    { field: 'upd_user', title: 'updateUser', show: true, disabled: false },
    { field: 'upd_date', title: 'updateDate', show: true, disabled: false, type: 'date' },
]

const enhance = compose(
    withState('tableCol', 'setTableCol', tableCols),
    withState('totalRecords', 'setTotalRecords', 0),
    withState('processing', 'setpPocessing', false),
    withState("id", "setId", 0),
    withState("data", "setData", []),
    withState("dataProduct", "setDataProduct", []),
    withState("dataUnit", "setDataUnit", []),
    withState("valueSearch", "setValueSearch", ""),
    // -------------------------------   nghiệp vụ
    withState("productName", "setProductName", ''),
    withState("openDialogIns", "setOpenDialogIns", false),
    withState("openDialogRemove", "setOpenDialogRemove", false),

    withState("productId", "setProductId", 0),
    withState("time", "setTime", 0),
    withState("code", "setCode", ''),
    withState("timeDefault", "setTimeDefault", 0),
    withState("unitTimeDefault", "setUnitTimeDefault", ''),


    withHandlers({
        changeSearch: props => event => {
            props.setValueSearch(event.target.value)
            let valueSearch = event.target.value;
            if (onChangeEvTimeoutDelay) clearTimeout(onChangeEvTimeoutDelay)
            onChangeEvTimeoutDelay = setTimeout(() => {
                getList(props, valueSearch)
            }, 300);
        },

        handleCheckChangeColumnsView: props => item => {
            const index = tableCols.findIndex(obj => obj.field === item.field)
            if (index >= 0) {
                tableCols[index]['show'] = !tableCols[index]['show']
                props.setTableCol(tableCols)
            }
        },

        handleQueryNext: props => event => {
            getList(props, '%')
            event.preventDefault()
        },
        // --------------------------nghiệp vụ

        changeProductId: props => event => {
            props.setProductId(event.target.value);
        },
        changeTime: props => event => {
            props.setTime(+event.value);
        },
        changeCode: props => event => {
            props.setCode(event.target.value);
        },
        changeTimeDefault: props => event => {
            props.setTimeDefault(+event.value);
        },
        changeUnitTimeDefault: props => event => {
            props.setUnitTimeDefault(event.target.value);
        },
        changeDialogIns: props => event => {
            props.setOpenDialogIns(event ? true : false);
            props.setId(event ? event.id : 0);
            props.setProductId(event ? event.prod_id : 0);
            props.setProductName(event ? event.prod_nm : 0);
            props.setTime(event && event.id > 0 ? event.warn_amt : 0);
            props.setCode(event && event.id > 0 ? event.warn_time_tp : '');
        },
        changeDialogRemove: props => event => {
            props.setOpenDialogRemove(event ? true : false);
            props.setId(event ? event.id : 0);
            props.setProductName(event ? event.prod_nm : '');
        },
        checkValidateTimeDefault: props => event => {
            if (props.timeDefault === 0 || !props.unitTimeDefault || props.unitTimeDefault === 0)
                return true;
            return false
        },
        submitTimeDefault: props => event => {
            let data = [], type = props.id > 0 ? 'edit' : 'ins';
            data = [+props.timeDefault, props.unitTimeDefault]
            event.preventDefault();
            onSubmitTimeDefault(props, data, type);
            console.log(props)
        },
        checkValidate: props => event => {
            if (props.time === 0 || !props.productId || props.productId === 0 || !props.code || props.code === 0)
                return true;
            return false
        },
        submitFunct: props => event => {
            let data = [], type = 'ins';
            if (props.id > 0) { data.push(+props.id); type = 'edit' } else { data.push(+props.productId); }
            data = data.concat([+props.time, props.code]);
            event.preventDefault();
            onSubmit(props, data, type);
        },
        removeFunct: props => event => {
            event.preventDefault();
            onRemove(props, props.id);
        }
    }),

    lifecycle({

        componentDidMount() {
            getTimeDefault(this.props)
            subscrFunction(this.props);
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe();
        }

    })
);

export default withTranslation()(enhance(WarnTimeView));
