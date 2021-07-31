import {
    compose,
    withHandlers,
    withState,
    // withProps,
    // defaultProps,
    // hoistStatics,
    lifecycle,
} from 'recompose'
import * as CryptoJS from 'crypto-js'
import SnackBarService from '../../utils/service/snackbar_service'
import LoginView from './LoginView'
import glb_sv from '../../utils/service/global_service'
import socket_sv from '../../utils/service/socket_service'
import { inputPrmRq } from '../../utils/models/inputPrmRq'
import { requestInfo } from '../../utils/models/requestInfo'

import { withTranslation } from 'react-i18next'

//-- Khai báo cac biến của một hàm login ở đây
let login_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let login_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server

//-- gửi request xuống server --
const login = (props) => {
    if (1 == 1) {
        glb_sv.authFlag = true
        props.history.push('/page/dashboard')
        return
    }
}
//-- xử lý kết quả server trả về ---
const loginResult = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
    reqInfoMap.procStat = 2
    if (message['PROC_STATUS'] === 2) {
        reqInfoMap.resSucc = false
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    } else if (message['PROC_STATUS'] === 1) {
        glb_sv.authFlag = true
        glb_sv.userId = props.userName.trim()
        glb_sv.pharId = message['PROC_DATA'][0]['phar_id']
        glb_sv.branchId = message['PROC_DATA'][0]['branch_id']
        glb_sv.pharNm = message['PROC_DATA'][0]['pharNm']
        glb_sv.pharAddr = message['PROC_DATA'][0]['address']
        glb_sv.branch_nm = message['PROC_DATA'][0]['branch_nm']
        glb_sv.branch_add = message['PROC_DATA'][0]['branch_add']
        glb_sv.branch_phone = message['PROC_DATA'][0]['branch_phone']
        glb_sv.logo_nm = message['PROC_DATA'][0]['logo_nm']
        glb_sv.userEmail = message['PROC_DATA'][0]['userEmail']
        glb_sv.pharTele = message['PROC_DATA'][0]['boss_phone']
        glb_sv.userNm = message['PROC_DATA'][0]['userNm']
        glb_sv.userLev = message['PROC_DATA'][0]['userLev']
        glb_sv.userSt = message['PROC_DATA'][0]['userSt']

        const objAuthen = {
            userId: glb_sv.userId,
            pharId: glb_sv.pharId,
            branchId: glb_sv.branchId,
            branch_nm: glb_sv.branch_nm,
            branch_add: glb_sv.branch_add,
            branch_phone: glb_sv.branch_phone,
            logo_nm: glb_sv.logo_nm,
            pharNm: glb_sv.pharNm,
            userEmail: glb_sv.userEmail,
            userNm: glb_sv.userNm,
            userLev: glb_sv.userLev,
            userSt: glb_sv.userSt,
            address: glb_sv.pharAddr,
            pharTele: glb_sv.pharTele,
            auFlag: true,
        }
        const msgss = CryptoJS.AES.encrypt(JSON.stringify(objAuthen), glb_sv.configInfo['0101X10']).toString()
        const secrInfo = CryptoJS.AES.encrypt(message['PROC_DATA'][0]['tk'], glb_sv.configInfo['0101X10']).toString()
        sessionStorage.setItem('0101X10', msgss)
        sessionStorage.setItem('0101X11', secrInfo)
        glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        if (props.rememUserNm) {
            localStorage.setItem('userNm', props.userName)
        } else {
            localStorage.removeItem('userNm')
        }
        props.history.push('/page/dashboard')
    }
    SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
}
//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

const enhance = compose(
    withState('userName', 'setUserName', ''),
    withState('userNameFocus', 'setUserNameFocus', null),
    withState('stateErrorUserName', 'setStateErrorUserName', false),
    withState('helperTextUserName', 'setHelperTextUserName', ''),
    withState('rememUserNm', 'setRememUserNm', true),

    withState('userPass', 'setUserPass', ''),
    withState('userPassFocus', 'setUserPassFocus', null),
    withState('stateErrorPass', 'setStateErrorPass', false),
    withState('helperTextUserPass', 'setHelperTextUserPass', ''),
    withState('showPass', 'setShowPass', false),

    withState('processing', 'setProcessing', false),

    withHandlers({
        //-- receive element after rending html
        handleUserRef: (props) => (element) => {
            props.setUserNameFocus(element)
        },
        handlePassRef: (props) => (element) => {
            props.setUserPassFocus(element)
        },
        //-- end receive element after rending html

        changeUserName: (props) => (event) => {
            const { t } = props
            props.setHelperTextUserName(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorUserName(event.target.value === '' ? true : false)
            props.setUserName(event.target.value)
            sessionStorage.setItem('tempUserName', event.target.value)
        },

        changeUserPass: (props) => (event) => {
            const { t } = props
            props.setHelperTextUserPass(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorPass(event.target.value === '' ? true : false)
            props.setUserPass(event.target.value)
        },

        handleShowPass: (props) => (event) => {
            props.setShowPass(!props.showPass)
        },

        loginFunct: (props) => (event) => {
            event.preventDefault()
            login(props)
        },

        handleCheckRem: (props) => (event) => {
            props.setRememUserNm(event.target.checked)
        },
    }),
    lifecycle({
        componentDidMount() {
            subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe((message) => {
                glb_sv.logMessage('Receive login result: ' + JSON.stringify(message))
                if (message) {
                    const cltSeqResult = message['REQUEST_SEQ']
                    if (cltSeqResult === null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                        return
                    }
                    const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                    if (reqInfoMap === null || reqInfoMap === undefined) {
                        return
                    } else if (reqInfoMap.reqFunct === glb_sv.login_FcntNm) {
                        loginResult(this.props, message, cltSeqResult, reqInfoMap)
                    }
                }
            })
            setTimeout(() => {
                if (this.props.userNameFocus) this.props.userNameFocus.focus()
            }, 200)
            const userNm = localStorage.getItem('userNm')
            if (userNm) {
                setTimeout(() => {
                    this.props.setUserName(userNm)
                    this.props.setRememUserNm(true)
                    sessionStorage.setItem('tempUserName', userNm)
                }, 100)
            } else {
                setTimeout(() => {
                    this.props.setRememUserNm(false)
                    sessionStorage.setItem('tempUserName', '')
                }, 100)
            }
            //---- auto login
            this.props.setUserName('nhathuoc.101.1.1')
            this.props.setUserPass('hello1')
            setTimeout(() => {

                // login(this.props)
            }, 200)
        },
        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(LoginView))
