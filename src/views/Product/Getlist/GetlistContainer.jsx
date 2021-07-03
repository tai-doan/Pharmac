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

import GetlistView from './GetlistView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import functions from '../../../utils/constan/functions'
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
let product_InsFlag = false
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let currentId = 0

const config = {
    getList: {
        biz: 'report',
        object: 'rp_import',
        funct: 'imp_time',
        reqFunct: functions.GET_PROD_LIST,
        getListTimeOut: {},
    },
}

//-- function subcrible event that server result

//-- gửi request xuống server --
const getList = (props, valueSearch, rowsPerPage, pageCurr) => {
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (product_SendReqFlag) {
        return
    } else {
        product_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
    }
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    const { t } = props
    if (!socket_sv.getSocketStat()) {
        product_SendReqFlag = false
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    props.setpPocessing(true)
    const clientSeq = socket_sv.getClientSeq()
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.biz = config.getList.biz
    svInputPrm.object = config.getList.object
    svInputPrm.funct = config.getList.funct
    svInputPrm.input = ['20210401', '20210520', 0, '%', '%', 9999999, 999999]
    console.log('vào getList', JSON.stringify(svInputPrm))
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    glb_sv.logMessage('start send request: ' + JSON.stringify(svInputPrm))
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = config.getList.reqFunct
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    // config.getList.getListTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}

const resultGetList = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    glb_sv.logMessage('receive result')
    // clearTimeout(config['list'].getListTimeOut)
    product_SendReqFlag = false
    props.setpPocessing(false)
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        return
    }
    let newData = message['PROC_DATA']
    console.log('nhận data: ', newData)
    alert(JSON.stringify(newData))
}

const onRemove = (props, id) => {}

const resultRemove = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultGetListType = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const getListUnit = (props) => {}

const resultGetListUnit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const getListUnitTime = (props) => {}

const resultGetListUnitTime = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const insProduct = (props) => {}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

const tableCols = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'prod_nm', title: 'product.name', show: true, disabled: true, minWidth: 150 },
    { field: 'prod_tp_nm', title: 'product.type', show: true, disabled: true, minWidth: 100 },
    { field: 'barcode', title: 'product.barcode', show: true, disabled: false, minWidth: 100 },
    { field: 'designate', title: 'product.designate', show: false, disabled: false, minWidth: 100 },
    { field: 'contraind', title: 'product.contraind', show: false, disabled: false, minWidth: 100 },
    { field: 'contents', title: 'product.contents', show: true, disabled: false, minWidth: 100 },
    { field: 'dosage', title: 'product.dosage', show: false, disabled: false, minWidth: 100 },
    { field: 'packing', title: 'product.packing', show: true, disabled: false, minWidth: 200 },
    { field: 'manufact', title: 'product.manufact', show: true, disabled: false, minWidth: 100 },
    { field: 'warned', title: 'product.warned', show: false, disabled: false, minWidth: 100 },
    { field: 'interact', title: 'product.interact', show: false, disabled: false, minWidth: 100 },
    { field: 'effect', title: 'product.effect', show: false, disabled: false, minWidth: 100 },
    { field: 'overdose', title: 'product.overdose', show: false, disabled: false, minWidth: 100 },
    { field: 'storages', title: 'product.storages', show: false, disabled: false, minWidth: 100 },
    { field: 'upd_user', title: 'updateUser', show: false, disabled: false, minWidth: 100 },
    { field: 'upd_date', title: 'updateDate', show: false, type: 'date', disabled: false, minWidth: 100 },
]

const resetInsForm = (props) => {
    props.setExpanded(false)
    props.setProduct({
        name: '',
        code: '',
        type: '',
        barcode: '',
        contents: '',
        packing: '',
        manufact: '',
        storeQty: 0,
        impPrice: 0,
        expPrice: 0,
        unitId: '',
        minQty: 0,
        maxQty: 0,
        configWarn: 0,
        configUnit: '',
        designate: '',
        contraind: '',
        dosage: '',
        warned: '',
        effect: '',
        overdose: '',
    })
}
const enhance = compose(
    withState('tableCol', 'setTableCol', tableCols),
    withState('data', 'setData', []),
    withState('processing', 'setpPocessing', false),
    withState('totalRecords', 'setTotalRecords', 0),
    withState('id', 'setId', 0),
    withState('name', 'setName', ''), //-- for remove an item
    withState('product', 'setProduct', {
        name: '',
        code: '',
        type: '',
        barcode: '',
        contents: '',
        packing: '',
        manufact: '',
        storeQty: 0,
        impPrice: 0,
        lotno: '',
        expDt: '',
        expPrice: 0,
        unitId: '',
        minQty: 0,
        maxQty: 0,
        configWarn: 0,
        configUnit: '',
        designate: '',
        contraind: '',
        dosage: '',
        warned: '',
        effect: '',
        interact: '',
        pregb: '',
        overdose: '',
    }),

    withState('isExpanded', 'setExpanded', false),
    withState('searchVal', 'setSearchVal', ''),
    withState('dataTypes', 'setDataType', []),
    withState('dataUnits', 'setDataUnits', []),
    withState('dataConfigUnits', 'setDataConfigUnits', []),
    withState('unitIdFocus', 'setUnitIdFocus', null),
    withState('unitTimeIdFocus', 'setUnitTimeIdFocus', null),
    withState('minQtyFocus', 'setMinQtyFocus', null),

    withState('openDialogIns', 'setOpenDialogIns', false),
    withState('openDialogRemove', 'setOpenDialogRemove', false),
    withState('rowsPerPage', 'setRowsPerPage', 20),
    withState('page', 'setPage', 0),

    withHandlers({
        changeDialogIns: (props) => (event) => {
            props.setOpenDialogIns(event ? true : false)
            if (event) resetInsForm(props)
            props.setId(event ? event.id : 0)
            currentId = 0
        },

        submitFunct: (props) => (actTp) => {
            console.log('actTp', actTp)
            const storeQty = !props.product.storeQty ? 0 : props.product.storeQty
            const unitId = !props.product.unitId ? 0 : props.product.unitId
            const impPrice = !props.product.impPrice ? 0 : props.product.impPrice
            const expPrice = !props.product.expPrice ? 0 : props.product.expPrice
            const minQty = !props.product.minQty ? 0 : props.product.minQty
            const maxQty = !props.product.maxQty ? 0 : props.product.maxQty
            const configWarn = !props.product.configWarn ? 0 : props.product.configWarn
            const configUnit = props.product.configUnit
            if (storeQty > 0 && unitId === 0) {
                SnackBarService.alert(props.t('product.store_qty_require_unit_id'), true, 4, 3000)
                props.unitIdFocus.focus()
                return
            }
            if ((impPrice > 0 || expPrice > 0) && unitId === 0) {
                SnackBarService.alert(props.t('product.price_require_unit_id'), true, 4, 3000)
                props.unitIdFocus.focus()
                return
            }
            if ((minQty > 0 || maxQty > 0) && unitId === 0) {
                SnackBarService.alert(props.t('product.qty_require_unit_id'), true, 4, 3000)
                props.unitIdFocus.focus()
                return
            }
            if (minQty > 0 && minQty >= maxQty) {
                SnackBarService.alert(props.t('product.minqty_cant_over_maxqty'), true, 4, 3000)
                props.unitIdFocus.focus()
                return
            }
            if (configWarn > 0 && (!configUnit || configUnit === '')) {
                SnackBarService.alert(props.t('product.warning_time_require_unit_time'), true, 4, 3000)
                props.unitTimeIdFocus.focus()
                return
            }
            insProduct(props)
        },
        handleChange: (props) => (event) => {
            const newProd = props.product
            newProd[event.target.name] = event.target.value
            props.setProduct(newProd)
        },
        handleChangeNum: (props) => (val, name) => {
            const newProd = props.product
            newProd[name] = !val.floatValue ? 0 : val.floatValue
            props.setProduct(newProd)
        },
        changeDialogRemove: (props) => (event) => {
            props.setOpenDialogRemove(event ? true : false)
            props.setId(event ? event.id : 0)
            props.setName(event ? event.prod_nm : '')
        },

        checkValidate: (props) => () => {
            if (!props.product.name || props.product.name === '') return true
            if (!props.product.type || props.product.type === '') return true
            return false
        },

        removeFunct: (props) => (event) => {
            event.preventDefault()
            onRemove(props, props.id)
        },

        handleCheckChange: (props) => (item) => {
            const index = tableCols.findIndex((obj) => obj.field === item.field)
            if (index >= 0) {
                tableCols[index]['show'] = !tableCols[index]['show']
                props.setTableCol(tableCols)
            }
        },
        handleChangeExpand: (props) => (event) => {
            props.setExpanded(!props.isExpanded)
        },

        setSearchVal: (props) => (searStr) => {
            console.log('searStr', searStr)
            // props.setSearchVal(searStr)
        },
        unitIdRef: (props) => (element) => {
            props.setUnitIdFocus(element)
        },
        unitTimeRef: (props) => (element) => {
            props.setUnitTimeIdFocus(element)
        },
        minQtyRef: (props) => (element) => {
            props.setMinQtyFocus(element)
        },
        searchSubmit: (props) => (searStr) => {
            props.setSearchVal(searStr)
            props.setPage(0)
            props.setTotalRecords(0)
            getList(props, searStr, props.rowsPerPage, 0)
            console.log('searchSubmit => searStr', searStr)
        },

        handleChangePage: (props) => (event, newPage) => {
            console.log('handleChangePage, newPage:', newPage)
            props.setPage(newPage)
            getList(props, props.searchVal, props.rowsPerPage, newPage)
        },

        handleChangeRowsPerPage: (props) => (event) => {
            console.log('handleChangeRowsPerPage, newValue:', event.target.value)
            props.setRowsPerPage(parseInt(event.target.value, 10))
            props.setPage(0)
            getList(props, props.searchVal, parseInt(event.target.value, 10), 0)
        },
    }),

    lifecycle({
        componentDidMount() {
            getList(this.props, this.props.searchVal, this.props.rowsPerPage, this.props.page)
            getListUnit(this.props)
            getListUnitTime(this.props)

            subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe((message) => {
                console.log('resulte', message)
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
                        case functions.GET_PROD_LIST:
                            resultGetList(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.product_remove_FcntNm:
                            resultRemove(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.product_type_FcntNm:
                            resultGetListType(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.unit_FcntNm:
                            resultGetListUnit(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.unit_warn_time_FcntNm:
                            resultGetListUnitTime(this.props, message, cltSeqResult, reqInfoMap)
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

export default withTranslation()(enhance(GetlistView))
