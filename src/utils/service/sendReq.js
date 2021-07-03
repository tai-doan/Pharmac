import glb_sv from './global_service';
import socket_sv from './socket_service';
import control_sv from './control_services';
import { requestInfo } from '../models/requestInfo';
import { inputPrmRq } from '../models/inputPrmRq';

let sendRequestFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let unit_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let unit_ProcTimeOut2 //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let onChangeEvTimeoutDelay // xử lý debounce event Onchange Input
let saveContinue = false
let currentId = 0

const sendRequest = (serviceInfo, inputParams, handleResultFunc, isControlTimeOut = true, onTimeout = () => null, time, isClearReqInfoMap) => {
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (sendRequestFlag) {
        return
    } else {
        sendRequestFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }

    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        sendRequestFlag = false
        console.warn('mạng không ổn định, vui lòng thử lại ')
        return
    }

    // Nếu không có thì gọi request
    const clientSeq = socket_sv.getClientSeq()
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = serviceInfo.moduleName
    svInputPrm.screenName = serviceInfo.screenName
    svInputPrm.functionName = serviceInfo.functionName
    svInputPrm.operation = serviceInfo.operation
    svInputPrm.biz = serviceInfo.biz
    svInputPrm.object = serviceInfo.object
    svInputPrm.funct = serviceInfo.functionName
    svInputPrm.reqFunct = serviceInfo.reqFunct
    svInputPrm.inputPrm = inputParams
    svInputPrm.input = inputParams
    console.log('sendEvent 2 server => ', svInputPrm)
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)

    const controlTimeOutKey = serviceInfo.screenName + '|' + serviceInfo.reqFunct + '|' + JSON.stringify(inputParams)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = serviceInfo.reqFunct
    reqInfo.inputParam = svInputPrm.input
    reqInfo.timeOutKey = controlTimeOutKey
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)


    sendRequestFlag = false
    //-- start function to callback if timeout happened
    if (isControlTimeOut) {
        control_sv.ControlTimeOutObj[controlTimeOutKey] = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, controlTimeOutKey, serviceInfo, reqInfo.inputParam, onTimeout, clientSeq)
    }
}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, controlTimeOutKey, serviceInfo, inputParam, onTimeout, clientSeq = 0) => {
    if (clientSeq == null || clientSeq === undefined || isNaN(clientSeq)) {
        return
    }
    const reqIfMap = glb_sv.getReqInfoMapValue(clientSeq)
    if (reqIfMap == null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
        return
    }
    reqIfMap.resTime = new Date()
    reqIfMap.procStat = 4
    glb_sv.setReqInfoMapValue(clientSeq, reqIfMap)
    console.log('Request bị timeOut [reqFunct]: ', serviceInfo);
    control_sv.clearTimeOutRequest(controlTimeOutKey)
    // Clear luôn handleResultFunc để tránh lỗi khi server gửi response về sau khi đã timeout
    // control_sv.clearReqInfoMapRequest(clientSeq)
    // Xử lý time out cho từng màn hình nếu có
    if (reqIfMap.reqFunct === glb_sv.Product_FunctNm) {
        sendRequestFlag = false
    }
    console.warn('không nhận được phản hồi')
    onTimeout({ type: 'timeout', inputParam })
}

export default sendRequest