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

import InventoryView from './InventoryView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'

let inventory_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let inventory_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let onChangeEvTimeoutDelay // xử lý debounce event Onchange Input

//-- gửi request xuống server --
const getList = (props, valueSearch, action = '') => {
    console.log("Get Warn_exp");
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (inventory_SendReqFlag) {
        return
    } else {
        inventory_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        inventory_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    props.setpPocessing(true)
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    // let nextSeq = props.data.length == 0 ? 9999999999 : props.data[props.data.length - 1]['id']
    // if (action === 'reload') {
    //     nextSeq = 9999999;
    //     props.setData([])
    // }
    console.log('getList', valueSearch);
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config.moduleName
    svInputPrm.screenName = config.screenName
    svInputPrm.functionName = config['bytotal'].functionName
    svInputPrm.operation = config['bytotal'].operation
    svInputPrm.inputPrm = [0, valueSearch]
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['bytotal'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    inventory_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetList = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    console.log('resultGetList', message, reqInfoMap);
    clearTimeout(inventory_ProcTimeOut)
    inventory_SendReqFlag = false
    props.setpPocessing(false)
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        SnackBarService.alert(message['PROC_MESSAGE'], true, 4, 3000)
        return
    }

    // props.setData(message['PROC_DATA'])
    console.log('props.data', props.data.length)
    let newData = !!props.data ? props.data : []
    newData = newData.concat(message['PROC_DATA'])
    console.log('PROC_DATA', message)
    console.log('newData', newData.length)
    props.setData(newData)
    if (newData.length > 0) {
        props.setTotalRecords(newData[0]['total'])
    }
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
        inventory_SendReqFlag = false
        props.setpPocessing(false)
    }
    const { t } = props
    SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
}

const config = {
    moduleName: 'report',
    screenName: 'inventory',
    bytotal: {
        functionName: 'get_tol',
        operation: 'Q',
        reqFunct: glb_sv.rpt_inventory_bytotal_FcntNm,
    },
    bylot: {
        functionName: 'get_dt',
        operation: 'Q',
        reqFunct: glb_sv.rpt_inventory_bylot_FcntNm,
    }
}

const tableCols = [
    { field: 'prod_nm', title: 'report.inventory.prod_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'inven_all_qty_rp', title: 'report.inventory.inven_all_qty_rp', show: true, disabled: false, minWidth: 100 },
    { field: 'tot_all_imp_qty_rp', title: 'report.inventory.tot_all_imp_qty_rp', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'tot_all_exp_qty_rp', title: 'report.inventory.tot_all_exp_qty_rp', show: true, disabled: false, minWidth: 100 },
    { field: 'tot_all_exp_cal_qty_rp', title: 'report.inventory.tot_all_exp_cal_qty_rp', show: true, disabled: false, minWidth: 100 },
]

const tableCols2 = [
    { field: 'prod_nm', title: 'report.inventory.prod_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'lot_no', title: 'report.inventory.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'exp_dt', title: 'report.inventory.exp_dt', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'inven_qty_rp', title: 'report.inventory.inven_qty_rp', show: true, disabled: false, minWidth: 100 },
    { field: 'tot_imp_qty_rp', title: 'report.inventory.tot_imp_qty_rp', show: true, disabled: false, minWidth: 100 },
    { field: 'tot_exp_qty_rp', title: 'report.inventory.tot_exp_qty_rp', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'tot_exp_cal_qty_rp', title: 'report.inventory.tot_exp_cal_qty_rp', show: true, disabled: false, minWidth: 100 },
]
const dataTypes = [
    { id: 0, name: 'Lấy toàn bộ'},
    { id: 1, name: 'Lấy các sp đã hết hàng'},
    { id: 2, name: 'Lấy sản phẩm còn hàng'}
]
const enhance = compose(
    withState('tableCol', 'setTableCol', tableCols),
    withState('tableCol2', 'setTableCol2', tableCols2),
    withState('dataType', 'setDataType', dataTypes),
    withState('data', 'setData', []),
    withState('id', 'setId', 0),
    withState('totalRecords', 'setTotalRecords', 0),
    withState('processing', 'setpPocessing', false),
    withState('valueSearch', 'setValueSearch', ''),
    // -------------------------------   nghiệp vụ

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

    }),

    lifecycle({
        componentDidMount() {
            getList(this.props, '')

            subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe(message => {
                if (message) {
                    const cltSeqResult = message['REQUEST_SEQ']
                    if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                        return
                    }
                    const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                    // glb_sv.logMessage('reqInfoMap result: ' + JSON.stringify(reqInfoMap))
                    if (reqInfoMap == null || reqInfoMap === undefined) {
                        return
                    }
                    switch (reqInfoMap.reqFunct) {
                        case glb_sv.rpt_inventory_bytotal_FcntNm:
                            resultGetList(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.rpt_inventory_bylot_FcntNm:
                            resultGetList(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        default:
                            return
                    }
                }
            })
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(InventoryView))
