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

import InsExportView from './InsExportView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'
import { truncate } from 'lodash'

//-- Khai báo cac biến của một hàm Customer ở đây
let ins_exportOrder_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let ins_exportOrder_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
//-- function subcrible event that server result

const subscrFunction = (props) => {
    subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe((message) => {
        if (message) {
            const cltSeqResult = message['REQUEST_SEQ']
            if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                return
            }
            const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
            glb_sv.logMessage('reqInfoMap result: ' + JSON.stringify(reqInfoMap))
            if (reqInfoMap == null || reqInfoMap === undefined) {
                return
            }
            switch (reqInfoMap.reqFunct) {
                case glb_sv.exportOrder_row_FcntNm:
                    resultGetRowExportOrder(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_ins_FcntNm:
                    resultInsExportOrder(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_edit_FcntNm:
                    resultInsExportOrder(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_del_FcntNm:
                    resultDelExportOrder(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_cus_FcntNm:
                    resultListCust(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_agent_FcntNm:
                    resultListAgent(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_inv_auto_FcntNm:
                    resultListInvAutor(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_detail_FcntNm:
                    resultListOrderDetail(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_detail_ins_FcntNm:
                    resultInsOrderDetail(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_detail_edit_FcntNm:
                    resultInsOrderDetail(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_detail_del_FcntNm:
                    resultDelOrderDetail(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_unit_FcntNm:
                    resultListUnit(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_lot_FcntNm:
                    resultListLot(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_prod_FcntNm:
                    resultListProd(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_price_FcntNm:
                    resultListPrice(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_inven_lot_FcntNm:
                    resultListInvenLot(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.exportOrder_support_list_inven_total_FcntNm:
                    resultListInvenTotal(props, message, cltSeqResult, reqInfoMap)
                    break
                default:
                    return
            }
        }
    })
}

//-- gửi request xuống server --

const sendRequest = (props, svConfig, inputParam) => {}

const resultGetRowExportOrder = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultInsExportOrder = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultDelExportOrder = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultListCust = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultListAgent = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListInvAutor = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultInsOrderDetail = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    props.setLoading(false)
}

const resultDelOrderDetail = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const resultListOrderDetail = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListUnit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListLot = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListProd = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListPrice = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListInvenLot = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
const resultListInvenTotal = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}
//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

const tableCols = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'id', title: 'order.ins_export.id_detail', show: false, disabled: true, minWidth: 100 },
    { field: 'invoice-detail_id', title: 'order.ins_export.invoice', show: true, disabled: false, minWidth: 100 },
    { field: 'exp_tp', title: 'order.ins_export.exp_tp', show: false, disabled: false, minWidth: 100 },
    { field: 'exp_tp_nm', title: 'order.ins_export.exp_tp_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'prod_id', title: 'order.ins_export.prod_id', show: true, disabled: true, minWidth: 100 },
    { field: 'prod_nm', title: 'order.ins_export.prod_nm', show: false, disabled: true, minWidth: 100 },
    { field: 'lot_no', title: 'order.ins_export.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'qty', title: 'order.ins_export.qty', show: true, disabled: false, minWidth: 100 },
    { field: 'unit_id  ', title: 'order.ins_export.unit_id', show: true, disabled: false, minWidth: 100 },
    { field: 'unit_nm ', title: 'order.ins_export.unit_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'price', title: 'order.ins_export.price', show: true, disabled: true, minWidth: 100 },
    { field: 'vals ', title: 'order.ins_export.vals', show: false, disabled: false, minWidth: 100 },
    { field: 'upd_user', title: 'updateUser', show: true, disabled: false, minWidth: 100 },
    { field: 'upd_date', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
]

const config = {}

const enhance = compose(
    withState('tableCol', 'setTableCol', tableCols),
    withState('data', 'setData', []),

    withState('listCust', 'setListCust', []),
    withState('listAgent', 'setListAgent', []),
    withState('listInvau', 'setListInvau', []),

    withState('listUnit', 'setListUnit', []),
    withState('listLot', 'setListLot', []),
    withState('listProd', 'setListProd', []),
    withState('listPrice', 'setListPrice', []),
    withState('listInvenLot', 'setListInvenLot', []),
    withState('listInvenTotal', 'setListInvenTotal', []),

    withState('loading', 'setLoading', true),

    withState('openDialogIns', 'setOpenDialogIns', false),
    withState('openDialogRemove', 'setOpenDialogRemove', false),

    withState('id_master', 'setId_master', 0),

    withState('invoice_no', 'setInvoice_no', ''),
    withState('vender_id', 'setVender_id', ''),
    withState('person_s', 'setPerson_s', ''),
    withState('person_r', 'setPerson_r', ''),
    withState('invoice_auto', 'setInvoice_auto', ''),

    withState('imp_tp', 'setImp_tp', ''),
    withState('prod_id', 'setProd_id', ''),
    withState('lot_no', 'setLot_no', ''),
    withState('made_dt', 'setMade_dt', ''),
    withState('exp_dt', 'setExp_dt', ''),
    withState('qty', 'setQty', ''),
    withState('unit_id', 'setUnit_id', ''),
    withState('price', 'setPrice', ''),

    withHandlers({
        changeInvoice_no: (props) => (event) => {
            props.setInvoice_no(event.target.value)
        },
        changeVender_id: (props) => (event) => {
            props.setVender_id(event.target.value)
        },
        changePerson_s: (props) => (event) => {
            props.setPerson_s(event.target.value)
        },
        changePerson_r: (props) => (event) => {
            props.setPerson_r(event.target.value)
        },
        changeInvoice_auto: (props) => (event) => {
            props.setInvoice_auto(event.target.value)
        },

        changeImp_tp: (props) => (event) => {
            props.setImp_tp(event.target.value)
        },
        changeProd_id: (props) => (event) => {
            props.setProd_id(event.target.value)
        },
        changeLot_no: (props) => (event) => {
            props.setLot_no(event.target.value)
        },
        changeMade_dt: (props) => (event) => {
            props.setMade_dt(event.target.value)
        },
        changeExp_dt: (props) => (event) => {
            props.setExp_dt(event.target.value)
        },
        changeQty: (props) => (event) => {
            props.setQty(event.target.value)
        },
        changeUnit_id: (props) => (event) => {
            props.setUnit_id(event.target.value)
        },
        changePrice: (props) => (event) => {
            props.setPrice(event.target.value)
        },

        checkValidate: (props) => (event) => {
            // if (props.name === '') {
            //     return true;
            // }
            // return false;
        },

        submitMaster: (props) => (event) => {
            event.preventDefault()
            let inputParam = []
            if (props.id > 0) {
                inputParam.push(props.id)
                inputParam = inputParam.concat([props.invoice_no, props.vender_id, props.person_s, props.person_r])
                sendRequest(props, config.edit, inputParam)
                console.log('edit', props, inputParam)
            } else {
                inputParam = inputParam.concat([
                    props.invoice_no,
                    props.vender_id,
                    props.person_s,
                    props.person_r,
                    props.invoice_auto,
                ])
                sendRequest(props, config.ins, inputParam)
                console.log('ins', props, inputParam)
            }
        },

        submitDetail: (props) => (event) => {
            event.preventDefault()

            let inputParam = []
            if (event.target.key) {
                let i = event.target.key
                const rowData = props.data[i - 1]
                inputParam.push(props.id_master)
                inputParam = inputParam.concat([
                    rowData.imp_tp,
                    rowData.prod_id,
                    rowData.lot_no,
                    rowData.made_dt,
                    rowData.exp_dt,
                    rowData.qty,
                    rowData.unit_id,
                    rowData.price,
                ])
                sendRequest(props, config.edit_detail, inputParam)
                console.log('edit_detail', rowData, inputParam)
            } else {
                // inputParam.push(rowData.id);
                inputParam = inputParam.concat([
                    props.imp_tp,
                    props.prod_id,
                    props.lot_no,
                    props.made_dt,
                    props.exp_dt,
                    props.qty,
                    props.unit_id,
                    props.price,
                ])
                sendRequest(props, config.ins_detail, inputParam)
                console.log('ins_detail', props, inputParam)
            }
        },
    }),

    lifecycle({
        componentDidMount() {
            const msgObj = { msgTp: glb_sv.setExpand, data: false }
            glb_sv.commonEvent.next(msgObj)

            sendRequest(this.props, config.vendor, [])
            if (+this.props.id > 0) {
                this.props.setId_master(this.props.id)
                sendRequest(this.props, config.get_row, [this.props.id])
            } else {
                this.props.setLoading(false)
            }
            subscrFunction(this.props)
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(InsExportView))
