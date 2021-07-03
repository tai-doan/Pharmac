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

import InsCusView from './InsCusView'
import SnackBarService from '../../../utils/service/snackbar_service'

import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import { inputPrmRq } from '../../../utils/models/inputPrmRq'
import { requestInfo } from '../../../utils/models/requestInfo'

//-- Khai báo cac biến của một hàm Customer ở đây
let customer_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let customer_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
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
                case glb_sv.customer_row_FcntNm:
                    console.log('resultGetRowProduct', props)
                    resultGetRowCustomer(props, message, cltSeqResult, reqInfoMap)
                    // getListType(props);
                    break
                // case glb_sv.customer_type_FcntNm:
                //     resultGetListType(props, message, cltSeqResult, reqInfoMap);
                //     // getListUnit(props);
                //     break;
                // case glb_sv.unit_FcntNm:
                //     resultGetListUnit(props, message, cltSeqResult, reqInfoMap);
                //     break;
                // case glb_sv.unit_warn_time_FcntNm:
                //     resultGetListUnitTime(props, message, cltSeqResult, reqInfoMap);
                //     break;
                case glb_sv.customer_ins_FcntNm:
                    resultSubmit(props, message, cltSeqResult, reqInfoMap)
                    break
                case glb_sv.customer_edit_FcntNm:
                    resultSubmit(props, message, cltSeqResult, reqInfoMap)
                    break

                default:
                    return
            }
        }
    })
}

//-- gửi request xuống server --
const getRowCustomer = (props, id) => {}

const resultGetRowCustomer = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

const onSubmit = (props, data, type) => {}

const resultSubmit = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

const config = {}

const enhance = compose(
    withState('loading', 'setLoading', true),
    withState('dataType', 'setDataType', []),
    withState('dataUnit', 'setDataUnit', []),
    withState('dataUnitTime', 'setDataUnitTime', []),

    withState('openDialogIns', 'setOpenDialogIns', false),
    withState('openDialogRemove', 'setOpenDialogRemove', false),

    withState('name', 'setName', ''),
    withState('phone', 'setPhone', ''),
    withState('addr', 'setAddr', ''),
    withState('email', 'setEmail', ''),
    withState('fax', 'setFax', ''),
    withState('nameEN', 'setNameEN', ''),
    withState('shortNm', 'setShortNm', ''),
    withState('website', 'setWebsite', ''),
    withState('taxCd', 'setTaxCd', ''),
    withState('bankActNo', 'setBankActNo', ''),
    withState('bankActNm', 'setBankActNm', ''),
    withState('bankNm', 'setBankNm', ''),
    withState('agentNm', 'setAgentNm', ''),
    withState('agentFun', 'setAgentFun', ''),
    withState('agentAddr', 'setAgentAddr', ''),
    withState('agentPhone', 'setAgentPhone', ''),
    withState('agentEmail', 'setAgentEmail', ''),

    withHandlers({
        changeName: (props) => (event) => {
            props.setName(event.target.value)
        },
        changePhone: (props) => (event) => {
            props.setPhone(event.target.value)
        },
        changeAddr: (props) => (event) => {
            props.setAddr(event.target.value)
        },
        changeEmail: (props) => (event) => {
            // console.log("emak", e);
            props.setEmail(event.target.value)
        },
        changeFax: (props) => (event) => {
            props.setFax(event.target.value)
        },
        changeNameEN: (props) => (event) => {
            props.setNameEN(event.target.value)
        },
        changeShortNm: (props) => (event) => {
            props.setShortNm(event.target.value)
        },
        changeWebsite: (props) => (event) => {
            props.setWebsite(event.target.value)
        },
        changeTaxCd: (props) => (event) => {
            props.setTaxCd(event.target.value)
        },
        changeBankActNo: (props) => (event) => {
            props.setBankActNo(event.target.value)
        },
        changeBankActNm: (props) => (event) => {
            props.setBankActNm(event.target.value)
        },
        changeBankNm: (props) => (event) => {
            props.setBankNm(event.target.value)
        },
        changeAgentNm: (props) => (event) => {
            props.setAgentNm(event.target.value)
        },
        changeAgentFun: (props) => (event) => {
            props.setAgentFun(event.target.value)
        },
        changeAgentAddr: (props) => (event) => {
            props.setAgentAddr(event.target.value)
        },
        changeAgentPhone: (props) => (event) => {
            props.setAgentPhone(event.target.value)
        },
        changeAgentEmail: (props) => (event) => {
            props.setAgentEmail(event.target.value)
        },
        checkValidate: (props) => (event) => {
            if (props.name === '') {
                return true
            }
            return false
        },
        submitFunct: (props) => (event) => {
            let data = [],
                type = 'ins'
            if (props.id > 0) {
                data.push(props.id)
                type = 'edit'
            } // Tạm thời lấy 4 trường này thôi
            data = data.concat([props.name, props.phone, props.addr, props.email]) //props.fax, props.nameEN, props.shortNm, props.website, props.taxCd, props.bankActNo, props.bankActNm, props.bankNm, props.agentNm, props.agentFun, props.agentAddr, props.agentPhone, props.agentEmail]);
            console.log('ins', type, data)
            event.preventDefault()

            onSubmit(props, data, type)
        },
    }),

    lifecycle({
        componentDidMount() {
            if (+this.props.id > 0) {
                getRowCustomer(this.props, this.props.id)
            } else {
                // getListType(this.props);
                this.props.setLoading(false)
            }
            subscrFunction(this.props)
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(InsCusView))
