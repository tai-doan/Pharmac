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

import ImportOrderView from './ImportOrderView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'
import { debounce, throttle } from 'lodash'

let customer_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let customer_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let onChangeEvTimeoutDelay // xử lý debounce event Onchange Input

//-- gửi request xuống server --
const getList = (props, valueSearch, action = '') => {}

const resultGetList = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const onRemove = (props, id) => {}

const resultRemove = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

const config = {}

const tableCols = [
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'id', title: 'order.import.id', show: true, disabled: true, minWidth: 100 },
    { field: 'invoice_no', title: 'order.import.invoice_no', show: true, disabled: true, minWidth: 100 },
    { field: 'invoice_stat', title: 'order.import.invoice_stat', show: true, disabled: false, minWidth: 100 },
    { field: 'invoice_stat_nm ', title: 'order.import.invoice_stat_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'vender_id', title: 'order.import.vender_id', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'vender_nm_v', title: 'order.import.vender_nm_v', show: true, disabled: true, minWidth: 100 },
    { field: 'input_dt', title: 'order.import.input_dt', show: true, disabled: true, minWidth: 100 },
    { field: 'inv_values', title: 'order.import.inv_values', show: true, disabled: false, minWidth: 100 },
    { field: 'person_s', title: 'order.import.person_s', show: true, disabled: false, minWidth: 100 },
    { field: 'person_r ', title: 'order.import.person_r', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'upd_user', title: 'order.import.upd_user', show: true, disabled: true, minWidth: 100 },
    { field: 'upd_date', title: 'order.import.upd_date', show: true, disabled: true, minWidth: 100 },
]
const enhance = compose(
    withState('tableCol', 'setTableCol', tableCols),
    withState('data', 'setData', []),
    withState('id', 'setId', 0),
    withState('totalRecords', 'setTotalRecords', 0),
    withState('processing', 'setpPocessing', false),
    withState('valueSearch', 'setValueSearch', ''),
    // -------------------------------   nghiệp vụ
    withState('openDialogIns', 'setOpenDialogIns', false), // insert
    withState('openDialogRemove', 'setOpenDialogRemove', false), // remove

    withState('name', 'setName', ''),
    withState('note', 'setNote', ''),

    withHandlers({
        changeSearch: (props) => (event) => {
            props.setValueSearch(event.target.value)
            let valueSearch = event.target.value
            if (onChangeEvTimeoutDelay) clearTimeout(onChangeEvTimeoutDelay)
            onChangeEvTimeoutDelay = setTimeout(() => {
                getList(props, valueSearch)
            }, 300)
        },

        handleCheckChangeColumnsView: (props) => (item) => {
            const index = tableCols.findIndex((obj) => obj.field === item.field)
            if (index >= 0) {
                tableCols[index]['show'] = !tableCols[index]['show']
                props.setTableCol(tableCols)
            }
        },

        handleQueryNext: (props) => (event) => {
            getList(props, '%')
            event.preventDefault()
        },

        // --------------------------nghiệp vụ
        changeName: (props) => (event) => {
            props.setName(event.target.value)
        },

        changeNote: (props) => (event) => {
            props.setNote(event.target.value)
        },

        changeDialogIns: (props) => (event) => {
            props.setOpenDialogIns(event ? true : false)
            props.setId(event ? event.id : 0)
            props.setName(event && event.id > 0 ? event.customer_nm : '')
            props.setNote(event && event.id > 0 ? event.note : '')
        },

        changeDialogRemove: (props) => (event) => {
            props.setOpenDialogRemove(event ? true : false)
            props.setId(event ? event.id : 0)
            props.setName(event ? event.customer_nm : '')
        },

        checkValidate: (props) => (event) => {
            if (props.name === '') return true
            return false
        },

        removeFunct: (props) => (event) => {
            event.preventDefault()
            onRemove(props, props.id)
        },
    }),

    lifecycle({
        componentDidMount() {
            getList(this.props, '')

            subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe((message) => {
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
                        case glb_sv.importOrder_FcntNm:
                            resultGetList(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.importOrder_del_FcntNm:
                            resultRemove(this.props, message, cltSeqResult, reqInfoMap)
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

export default withTranslation()(enhance(ImportOrderView))
