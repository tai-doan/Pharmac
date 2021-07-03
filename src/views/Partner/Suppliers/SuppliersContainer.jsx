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

import SuppliersView from './SuppliersView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'
import { debounce, throttle } from 'lodash'

let supplier_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let supplier_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
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
    { field: 'id', title: 'partner.supplier.id', show: true, disabled: true, minWidth: 100 },
    { field: 'vender_nm_v', title: 'partner.supplier.vender_nm_v', show: true, disabled: false, minWidth: 100 },
    { field: 'vender_nm_e', title: 'partner.supplier.vender_nm_e', show: true, disabled: false, minWidth: 100 },
    {
        field: 'vender_nm_short',
        title: 'partner.supplier.vender_nm_short',
        show: true,
        disabled: false,
        minWidth: 100,
        type: 'date',
    },
    { field: 'address', title: 'partner.supplier.address', show: true, disabled: true, minWidth: 100 },
    { field: 'phone', title: 'partner.supplier.phone', show: true, disabled: true, minWidth: 100 },
    { field: 'fax', title: 'partner.supplier.fax', show: true, disabled: false, minWidth: 100 },
    { field: 'email', title: 'partner.supplier.email', show: true, disabled: false, minWidth: 100 },
    { field: 'website', title: 'partner.supplier.website', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'tax_cd', title: 'partner.supplier.tax_cd', show: true, disabled: true, minWidth: 100 },
    { field: 'bank_acnt_no', title: 'partner.supplier.bank_acnt_no', show: true, disabled: true, minWidth: 100 },
    { field: 'bank_acnt_nm', title: 'partner.supplier.bank_acnt_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'bank_nm', title: 'partner.supplier.bank_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'agent_nm', title: 'partner.supplier.agent_nm', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'agent_fun', title: 'partner.supplier.agent_fun', show: true, disabled: true, minWidth: 100 },
    { field: 'agent_address', title: 'partner.supplier.agent_address', show: true, disabled: true, minWidth: 100 },
    { field: 'agent_phone', title: 'partner.supplier.agent_phone', show: true, disabled: false, minWidth: 100 },
    { field: 'agent_email', title: 'partner.supplier.agent_email', show: true, disabled: false, minWidth: 100 },
    { field: 'upd_user', title: 'updateUser', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'upd_date', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date' },
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
            props.setName(event && event.id > 0 ? event.supplier_nm : '')
            props.setNote(event && event.id > 0 ? event.note : '')
        },

        changeDialogRemove: (props) => (event) => {
            props.setOpenDialogRemove(event ? true : false)
            props.setId(event ? event.id : 0)
            props.setName(event ? event.supplier_nm : '')
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
                        case glb_sv.supplier_FcntNm:
                            resultGetList(this.props, message, cltSeqResult, reqInfoMap)
                            break
                        case glb_sv.supplier_del_FcntNm:
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

export default withTranslation()(enhance(SuppliersView))
