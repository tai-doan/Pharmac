import { compose, withHandlers, withState, lifecycle } from 'recompose'

import { withTranslation } from 'react-i18next'

import ForgotPassView from './ForgotPassView'
import SnackBarService from '../../utils/service/snackbar_service'

import glb_sv from '../../utils/service/global_service'
import socket_sv from '../../utils/service/socket_service'
import { inputPrmRq } from '../../utils/models/inputPrmRq'
import { requestInfo } from '../../utils/models/requestInfo'
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

//-- Khai báo cac biến của một hàm forgotPass ở đây
let forgotPass_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let forgotPass_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server

//-- gửi request xuống server --
const forgotPass = props => {
    //-- Kiểm tra cờ xem hệ thống đã thực hiện chưa -> tránh việc double khi click vào button nhiều liền
    if (forgotPass_SendReqFlag) {
        return
    } else {
        forgotPass_SendReqFlag = true //-- => Bật cờ đánh dấu trạng thái bắt đầu thực hiện
        props.setProcessing(true)
    }
    const { t } = props
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        forgotPass_SendReqFlag = false
        props.setProcessing(false)
        SnackBarService.alert(t('message.network'), true, 4, 3000)
        return
    }
    if (props.userName === '') {
        forgotPass_SendReqFlag = false
        props.setHelperTextUserName(t('message.required'))
        props.setStateErrorUserName(true)
        props.setProcessing(false)
        if (props.userNameFocus) props.userNameFocus.focus()
        return
    }
    if (props.email === '') {
        forgotPass_SendReqFlag = false
        props.setHelperTextEmail(t('message.required'))
        props.setStateErrorEmail(true)
        props.setProcessing(false)
        if (props.emailFocus) props.emailFocus.focus()
        return
    }

    sessionStorage.setItem('tempUserName', props.userName)
    const clientSeq = socket_sv.getClientSeq()
    // -- send requst to server
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.moduleName = 'admin'
    svInputPrm.screenName = 'loginproc'
    svInputPrm.functionName = 'reset'
    svInputPrm.operation = 'U'
    svInputPrm.inputPrm = [props.userName.trim(), props.email.trim()]
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = glb_sv.forgotPass_FcntNm
    reqInfo.inputParam = svInputPrm.inputPrm
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    //-- start function to callback if timeout happened
    forgotPass_ProcTimeOut = setTimeout(solving_TimeOut, glb_sv.timeoutNumber, props, clientSeq)
}
//-- xử lý kết quả server trả về ---
const forgotPassResult = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    clearTimeout(forgotPass_ProcTimeOut)
    forgotPass_SendReqFlag = false
    props.setProcessing(false)
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
        return
    }
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        sessionStorage.setItem('forgotSuccess', 1)
    } else {
        setTimeout(() => {
            props.history.push('/login')
        }, 1000)
        sessionStorage.setItem('forgotSuccess', 0)
    }
    SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 5000)
}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(cltSeq)) {
        return
    }
    const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq)
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
        return
    }
    reqIfMap.resTime = new Date()
    reqIfMap.procStat = 4
    glb_sv.setReqInfoMapValue(cltSeq, reqIfMap)
    if (reqIfMap.reqFunct === glb_sv.forgotPass_FunctNm) {
        forgotPass_SendReqFlag = false
        props.setProcessing(false)
    }
    const { t } = props
    SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
}

const enhance = compose(
    withState('userName', 'setUserName', ''),
    withState('userNameFocus', 'setUserNameFocus', null),
    withState('stateErrorUserName', 'setStateErrorUserName', false),
    withState('helperTextUserName', 'setHelperTextUserName', ''),

    withState('email', 'setEmail', ''),
    withState('emailFocus', 'setEmailFocus', null),
    withState('stateErrorEmail', 'setStateErrorEmail', false),
    withState('helperTextEmail', 'setHelperTextEmail', ''),

    withState('processing', 'setProcessing', false),
    // withState('flagChange', 'setFlagChange', -1),

    withHandlers({
        //-- receive element after rending html
        handleUserNameRef: props => element => {
            props.setUserNameFocus(element)
        },
        handleEmailRef: props => element => {
            props.setEmailFocus(element)
        },
        //-- end receive element after rending html
        changeUserName: props => event => {
            const { t } = props
            props.setHelperTextUserName(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorUserName(event.target.value === '' ? true : false)
            props.setUserName(event.target.value)
        },
        changeEmail: props => event => {
            const { t } = props
            let check = glb_sv.validateEmail(event.target.value)
            props.setHelperTextEmail(
                !check ? (event.target.value === '' ? t('message.required') : t('message.email')) : ''
            )
            props.setStateErrorEmail(!check)
            props.setEmail(event.target.value)
        },
        forgotPassFunct: props => event => {
            event.preventDefault()
            forgotPass(props)
        },
    }),

    lifecycle({
        componentDidMount() {
            subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe(message => {
                glb_sv.logMessage('Receive forgotPass result: ' + JSON.stringify(message))
                if (message) {
                    const cltSeqResult = message['REQUEST_SEQ']
                    if (cltSeqResult === null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                        return
                    }
                    const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                    glb_sv.logMessage('reqInfoMap result: ' + JSON.stringify(reqInfoMap))
                    if (reqInfoMap === null || reqInfoMap === undefined) {
                        return
                    } else if (reqInfoMap.reqFunct === glb_sv.forgotPass_FcntNm) {
                        forgotPassResult(this.props, message, cltSeqResult, reqInfoMap)
                    }
                }
            })

            if (sessionStorage.getItem('tempUserName') && sessionStorage.getItem('tempUserName') !== '') {
                this.props.setUserName(sessionStorage.getItem('tempUserName') || '')
                setTimeout(() => {
                    if (this.props.emailFocus) this.props.emailFocus.focus()
                }, 200)
                // this.props.setFlagChange(1)
            } else {
                setTimeout(() => {
                    if (this.props.userNameFocus) this.props.userNameFocus.focus()
                }, 200)
                // this.props.setFlagChange(0)
            }
        },
        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(ForgotPassView))
