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

import ExportView from './ExportView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'
import moment from 'moment'

let exportorder_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let exportorder_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let onChangeEvTimeoutDelay // xử lý debounce event Onchange Input

//-- gửi request xuống server --
const getList = (props, valueSearch, dateSearchStat, dateSearchEnd ) => {
    console.log("Get Warn_exp", props, valueSearch );
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (exportorder_SendReqFlag) {
        return
    } else {
        exportorder_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        exportorder_SendReqFlag = false
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
    svInputPrm.functionName = config['list'].functionName
    svInputPrm.operation = config['list'].operation
    svInputPrm.inputPrm = [dateSearchStat, dateSearchEnd, valueSearch, 1, 0]
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['list'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    exportorder_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetList = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    console.log('resultGetList', message, reqInfoMap);
    clearTimeout(exportorder_ProcTimeOut)
    exportorder_SendReqFlag = false
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
    props.setCustList(newData)
    if (newData.length > 0) {
        // props.setTotalRecords(newData[0]['total'])
    }
}

const getCusList = (props, valueSearch, action = '') => {
    console.log("Get getCusList");
    const { t } = props
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (exportorder_SendReqFlag) {
        return
    } else {
        exportorder_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        exportorder_SendReqFlag = false
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
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = config['cust_list'].moduleName
    svInputPrm.screenName = config['cust_list'].screenName
    svInputPrm.functionName = config['cust_list'].functionName
    svInputPrm.operation = config['cust_list'].operation
    svInputPrm.inputPrm = ['%', 9999999999]
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config['cust_list'].reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    exportorder_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}
const resultGetCustList = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    console.log('resultGetCustList', message, reqInfoMap);
    clearTimeout(exportorder_ProcTimeOut)
    exportorder_SendReqFlag = false
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
        exportorder_SendReqFlag = false
        props.setpPocessing(false)
    }
    const { t } = props
    SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
}

const config = {
    moduleName: 'report',
    screenName: 'export',
    list: {
        functionName: 'get_exp',
        operation: 'Q',
        reqFunct: glb_sv.rpt_export_FcntNm,
    },
    cust_list: {
        moduleName: 'report',
        screenName: 'inventory',
        functionName: 'get_dt',
        operation: 'Q',
        reqFunct: glb_sv.rpt_customerExport_FcntNm,
    }

}

const tableCols = [
    { field: 'invoice_no', title: 'report.export_order.invoice_no', show: true, disabled: true, minWidth: 100 },
    { field: 'invoice_stat', title: 'report.export_order.invoice_stat', show: true, disabled: false, minWidth: 100 },
    { field: 'cust_nm_v', title: 'report.export_order.cust_nm_v', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'input_dt', title: 'report.export_order.input_dt', show: true, disabled: false, minWidth: 100 },
    { field: 'exp_tp_nm', title: 'report.export_order.exp_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'prod_nm', title: 'report.export_order.prod_nm', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'lot_no', title: 'report.export_order.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'qty', title: 'report.export_order.qty', show: true, disabled: false, minWidth: 100 },
    { field: 'unit_nm', title: 'report.export_order.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'price', title: 'report.export_order.price', show: true, disabled: false, minWidth: 100 },
    { field: 'vals', title: 'report.export_order.vals', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'upd_user', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'upd_date', title: 'updateDate', show: true, disabled: false, minWidth: 100 },
]

const enhance = compose(
    withState('tableCol', 'setTableCol', tableCols),
    withState('data', 'setData', []),
    withState('custList', 'setCustList', []),
    withState('id', 'setId', 0),
    withState('totalRecords', 'setTotalRecords', 0),
    withState('processing', 'setpPocessing', false),
    withState('valueSearch', 'setValueSearch', '%'),
    withState('dateSearchStat', 'setDateSearchStat', (moment().add('days', -30)).format('YYYYMMDD')),
    withState('dateSearchEnd', 'setDateSearchEnd', moment(new Date()).format('YYYYMMDD')),
    // -------------------------------   nghiệp vụ

    withHandlers({
        changeSearch: props => event => {
            props.setValueSearch(event.target.value)
            let valueSearch = event.target.value;
            if (onChangeEvTimeoutDelay) clearTimeout(onChangeEvTimeoutDelay)
            onChangeEvTimeoutDelay = setTimeout(() => {
                getList(props, valueSearch, props.dateSearchStat, props.dateSearchEnd)
            }, 300);
        },

        changeDateSearchStat: props => date => {
            props.setDateSearchStat(date)
            if (onChangeEvTimeoutDelay) clearTimeout(onChangeEvTimeoutDelay)
            onChangeEvTimeoutDelay = setTimeout(() => {
                getList(props, props.valueSearch, date, props.dateSearchEnd )
            }, 300);
        },

        changeDateSearchEnd: props => date => {
            props.setDateSearchEnd(date)
            if (onChangeEvTimeoutDelay) clearTimeout(onChangeEvTimeoutDelay)
            onChangeEvTimeoutDelay = setTimeout(() => {
                getList(props, props.valueSearch, props.dateSearchStat, date )
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
            getList(props, '%', props.dateSearchStat, props.dateSearchEnd)
            event.preventDefault()
        },

        // --------------------------nghiệp vụ 

    }),

    lifecycle({
        componentDidMount() {
            let props = this.props
            getList(props, props.valueSearch, props.dateSearchStat, props.dateSearchEnd)

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
                        case glb_sv.rpt_export_FcntNm:
                            resultGetList(this.props, message, cltSeqResult, reqInfoMap)
                            getCusList(this.props, '%')
                            break
                        case glb_sv.rpt_customerExport_FcntNm:
                            resultGetCustList(this.props, message, cltSeqResult, reqInfoMap)
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

export default withTranslation()(enhance(ExportView))
