import {
    compose,
    withHandlers,
    withState,
    // withProps,
    // defaultProps,
    // hoistStatics,
    lifecycle,
} from 'recompose'

import { withTranslation } from 'react-i18next'

import InsView from './InsView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'
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
let product_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let product_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
//-- function subcrible event that server result

const subscrFunction = props => {
    subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe(message => {
        if (message) {
            const cltSeqResult = message['REQUEST_SEQ']
            if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                return
            }
            const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
            if (reqInfoMap == null || reqInfoMap === undefined) {
                return
            }
            switch (reqInfoMap.reqFunct) {
                case glb_sv.product_row_FcntNm:
                    resultGetRowProduct(props, message, cltSeqResult, reqInfoMap)
                    getListType(props)
                    break
                case glb_sv.product_type_FcntNm:
                    resultGetListType(props, message, cltSeqResult, reqInfoMap)
                    getListUnit(props)
                    break
                case glb_sv.unit_FcntNm:
                    resultGetListUnit(props, message, cltSeqResult, reqInfoMap)
                    getListUnitTime(props)
                    break
                case glb_sv.unit_warn_time_FcntNm:
                    resultGetListUnitTime(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.product_ins_FcntNm:
                    resultSubmit(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.product_edit_FcntNm:
                    resultSubmit(props, message, cltSeqResult, reqInfoMap)
                    break

                default:
                    return
            }
        }
    })
}

//-- gửi request xuống server --
const getRowProduct = (props, id) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.moduleName
    svInputPrm.screenName = config.screenName
    svInputPrm.functionName = config['get_row'].functionName
    svInputPrm.operation = config['get_row'].operation
    svInputPrm.inputPrm = [+id]
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['get_row'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetRowProduct = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut)
    product_SendReqFlag = false
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    }
    let result = message['PROC_DATA']
    if (result.length > 0) {
        result = result[0]
        props.setName(result.prod_nm)
        props.setProductTypeId(result.prod_tp)
        props.setBarcode(result.barcode)
        props.setContents(result.contents)
        props.setPacking(result.packing)
        props.setManufact(result.manufact)
        props.setDesignate(result.designate)
        props.setContraind(result.contraind)
        props.setDosage(result.dosage)
        props.setWarned(result.warned)
        props.setInteract(result.interact)
        props.setPregb(result.pregb)
        props.setEffect(result.effect)
        props.setOverdose(result.overdose)
        props.setStorages(result.storages)
    }

    props.setLoading(false)
}

//-- gửi request xuống server --
const getListType = props => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.moduleName
    svInputPrm.screenName = config['list_type'].screenName
    svInputPrm.functionName = config['list_type'].functionName
    svInputPrm.operation = config['list_type'].operation
    svInputPrm.inputPrm = config['list_type'].inputPrm
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['list_type'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetListType = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut)
    product_SendReqFlag = false
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    }

    props.setDataType(message['PROC_DATA'])
}

const getListUnit = props => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.moduleName
    svInputPrm.screenName = config['list_unit'].screenName
    svInputPrm.functionName = config['list_unit'].functionName
    svInputPrm.operation = config['list_unit'].operation
    svInputPrm.inputPrm = config['list_unit'].inputPrm
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['list_unit'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetListUnit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut)
    product_SendReqFlag = false
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    }

    // props.setDataUnit(message['PROC_DATA'])
}

const getListUnitTime = props => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.moduleName
    svInputPrm.screenName = config['list_unit_time'].screenName
    svInputPrm.functionName = config['list_unit_time'].functionName
    svInputPrm.operation = config['list_unit_time'].operation
    svInputPrm.inputPrm = config['list_unit_time'].inputPrm
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['list_unit_time'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetListUnitTime = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut)
    product_SendReqFlag = false
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    }

    props.setDataUnitTime(message['PROC_DATA'])
}

const onSubmit = (props, data, type) => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }

    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.moduleName
    svInputPrm.screenName = config.screenName
    svInputPrm.functionName = config[type].functionName
    svInputPrm.operation = config[type].operation
    svInputPrm.inputPrm = data

    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = glb_sv.product_ins_FcntNm
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultSubmit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(product_ProcTimeOut)
    product_SendReqFlag = false
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)

    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    } else {
        getListType(props)
    }
}

const onInsPrice = props => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.price.moduleName
    svInputPrm.screenName = config.price.screenName
    svInputPrm.functionName = config.price['functionName'].functionName
    svInputPrm.operation = config.price['operation'].operation
    svInputPrm.inputPrm = config.price['inputPrm'].inputPrm
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config.price['reqFunct'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const onInsStoreLimit = props => {
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.store_limit.moduleName
    svInputPrm.screenName = config.store_limit.screenName
    svInputPrm.functionName = config.store_limit['functionName'].functionName
    svInputPrm.operation = config.store_limit['operation'].operation
    svInputPrm.inputPrm = config.store_limit['inputPrm'].inputPrm
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config.price['reqFunct'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    product_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {
    if (cltSeq == null || cltSeq === undefined || isNaN(cltSeq)) {
        return
    }
    const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq)
    if (reqIfMap == null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
        return
    }
    reqIfMap.resTime = new Date()
    reqIfMap.procStat = 4
    glb_sv.setReqInfoMapValue(cltSeq, reqIfMap)
    if (reqIfMap.reqFunct === glb_sv.Product_FunctNm) {
        product_SendReqFlag = false
    }
    const { t } = props
    SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
}

const config = {
    moduleName: 'common',
    screenName: 'prod',
    list_type: {
        screenName: 'com-info',
        functionName: 'GET_DICT_INFO_DDW_LIST',
        operation: 'Q',
        inputPrm: ['prod_tp'],
        reqFunct: glb_sv.product_type_FcntNm,
    },
    list_unit: {
        screenName: 'unit',
        functionName: 'get_all',
        operation: 'Q',
        inputPrm: ['', 9999999999],
        reqFunct: glb_sv.unit_FcntNm,
    },
    list_unit_time: {
        screenName: 'com-info',
        functionName: 'get_dict_info_ddw_list',
        operation: 'Q',
        inputPrm: ['warn_time_tp'],
        reqFunct: glb_sv.unit_warn_time_FcntNm,
    },
    price: {
        moduleName: 'export',
        screenName: 'reg-price',
        // get_row: {
        //     functionName: 'get_bid',
        //     operation: 'Q',
        //     reqFunct: glb_sv.price_FcntNm
        // },
        ins: {
            functionName: 'ins',
            operation: 'I',
            inputPrm: [],
            reqFunct: glb_sv.price_ins_FcntNm,
        },
    },
    store_limit: {
        moduleName: 'import',
        screenName: 'store-limit',
        // get_row: {
        //     functionName: 'get_bid',
        //     operation: 'Q',
        //     reqFunct: glb_sv.price_FcntNm
        // },
        ins: {
            functionName: 'ins',
            operation: 'I',
            inputPrm: [],
            reqFunct: glb_sv.store_limit_ins_FcntNm,
        },
    },
    get_row: {
        functionName: 'get_bid',
        operation: 'I',
        reqFunct: glb_sv.product_row_FcntNm,
    },
    ins: {
        functionName: 'ins',
        operation: 'I',
        reqFunct: glb_sv.product_ins_FcntNm,
    },
    edit: {
        functionName: 'upd',
        operation: 'U',
        reqFunct: glb_sv.product_edit_FcntNm,
    },
    del: {
        functionName: 'del',
        operation: 'D',
        reqFunct: glb_sv.product_remove_FcntNm,
    },
}

const enhance = compose(
    withState('loading', 'setLoading', true),
    withState('dataType', 'setDataType', []),
    withState('dataUnit', 'setDataUnit', []),
    withState('dataUnitTime', 'setDataUnitTime', []),

    withState('openDialogIns', 'setOpenDialogIns', false),
    withState('openDialogRemove', 'setOpenDialogRemove', false),

    withState('name', 'setName', ''),
    withState('productTypeId', 'setProductTypeId', ''),
    withState('barcode', 'setBarcode', ''),
    withState('price', 'setPrice', 0),
    withState('wholePrice', 'setWholePrice', 0),
    withState('originalPrice', 'setOriginalPrice', 0),
    withState('unitId', 'setUnitId', ''),
    withState('minQty', 'setMinQty', 0),
    withState('maxQty', 'setMaxQty', 0),
    withState('time', 'setTime', 0),
    withState('unitTimeId', 'setUnitTimeId', ''),
    withState('contents', 'setContents', ''),
    withState('packing', 'setPacking', ''),
    withState('manufact', 'setManufact', ''),
    withState('designate', 'setDesignate', ''),
    withState('contraind', 'setContraind', ''),
    withState('dosage', 'setDosage', ''),
    withState('warned', 'setWarned', ''),
    withState('interact', 'setInteract', ''),
    withState('pregb', 'setPregb', ''),
    withState('effect', 'setEffect', ''),
    withState('overdose', 'setOverdose', ''),
    withState('storages', 'setStorages', ''),

    withHandlers({
        changeName: props => event => {
            props.setName(event.target.value)
        },
        changeProductTypeId: props => event => {
            props.setProductTypeId(event.target.value)
        },
        changeBarcode: props => event => {
            props.setBarcode(event.target.value)
        },
        changeWholePrice: props => event => {
            props.setWholePrice(+event.value)
        },
        changePrice: props => event => {
            props.setPrice(+event.value)
        },
        changeOriginalPrice: props => event => {
            props.setOriginalPrice(+event.value)
        },
        changeUnitId: props => event => {
            props.setUnitId(event.target.value)
        },
        changeMinQty: props => event => {
            props.setMinQty(+event.value)
        },
        changeMaxQty: props => event => {
            props.setMaxQty(+event.value)
        },
        changeTime: props => event => {
            props.setTime(+event.value)
        },
        changeUnitTimeId: props => event => {
            props.setUnitTimeId(event.target.value)
        },
        changeContents: props => event => {
            props.setContents(event.target.value)
        },
        changePacking: props => event => {
            props.setPacking(event.target.value)
        },
        changeManufact: props => event => {
            props.setManufact(event.target.value)
        },
        changeDesignate: props => event => {
            props.setDesignate(event.target.value)
        },
        changeContraind: props => event => {
            props.setContraind(event.target.value)
        },
        changeDosage: props => event => {
            props.setDosage(event.target.value)
        },
        changeWarned: props => event => {
            props.setWarned(event.target.value)
        },
        changeInteract: props => event => {
            props.setInteract(event.target.value)
        },
        changePregb: props => event => {
            props.setPregb(event.target.value)
        },
        changeEffect: props => event => {
            props.setEffect(event.target.value)
        },
        changeOverdose: props => event => {
            props.setOverdose(event.target.value)
        },
        changeStorages: props => event => {
            props.setStorages(event.target.value)
        },
        checkValidate: props => event => {
            if (props.name === '' || !props.productTypeId || props.productTypeId === 0) {
                return true
            }
            return false
        },
        submitFunct: props => event => {
            let data = [],
                type = 'ins'
            if (props.id > 0) {
                data.push(props.id)
                type = 'edit'
            }
            data = data.concat([
                props.productTypeId,
                props.name,
                props.manufact,
                props.contents,
                props.contents,
                props.contraind,
                props.designate,
                props.warned,
                props.interact,
                props.pregb,
                props.effect,
                props.overdose,
                props.storages,
                props.packing,
                props.barcode,
            ])
            // if (props.price != 0 || props.wholePrice != 0 || props.originalPrice != 0){
            //     config.price.inputParam = [];
            // }

            event.preventDefault()

            onSubmit(props, data, type)
        },
    }),

    lifecycle({
        componentDidMount() {
            if (+this.props.id > 0) {
                getRowProduct(this.props, this.props.id)
            } else {
                getListType(this.props)
                this.props.setLoading(false)
            }
            subscrFunction(this.props)
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(InsView))
