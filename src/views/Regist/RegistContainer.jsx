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

import RegistView from './RegistView'
import SnackBarService from '../../utils/service/snackbar_service'

import glb_sv from '../../utils/service/global_service'
import socket_sv from '../../utils/service/socket_service'
import { inputPrmRq } from '../../utils/models/inputPrmRq'
import { requestInfo } from '../../utils/models/requestInfo'

//-- Khai báo cac biến của một hàm regist ở đây
let regist_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let regist_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
let firstNum = 0,
    secondNum = 0,
    thirdNum = 0

//-- gửi request xuống server --
const regist = (props) => {}

//-- xử lý kết quả server trả về ---
const registResult = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

function makeRandom() {
    firstNum = glb_sv.getRandomArbitrary(5, 10)
    secondNum = glb_sv.getRandomArbitrary(0, 4)
    thirdNum = glb_sv.getRandomArbitrary(1, 8)
    return firstNum + ' - ' + secondNum + ' + ' + thirdNum + ' = '
}
const enhance = compose(
    withState('phar_nm', 'setPharmacyName', ''),
    withState('stateErrorPharmacyName', 'setStateErrorPharmacyName', false),
    withState('helperTextPharmacyName', 'setHelperTextPharmacyName', ''),

    withState('licence', 'setLicence', ''),
    withState('stateErrorLicence', 'setStateErrorLicence', false),
    withState('helperTextLicence', 'setHelperTextLicence', ''),

    withState('licence_dt', 'setLicenceDate', ''),
    withState('stateErrorLicenceDT', 'setStateErrorLicenceDT', false),
    withState('helperTextLicenceDT', 'setHelperTextLicenceDT', ''),

    withState('licence_pl', 'setLicencePlace', ''),
    withState('stateErrorLicencePL', 'setStateErrorLicencePL', false),
    withState('helperTextLicencePL', 'setHelperTextLicencePL', ''),

    withState('address', 'setAddress', ''),
    withState('stateErrorAddress', 'setStateErrorAddress', false),
    withState('helperTextAddress', 'setHelperTextAddress', ''),

    withState('boss_nm', 'setBossName', ''),
    withState('stateErrorBossName', 'setStateErrorBossName', false),
    withState('helperTextBossName', 'setHelperTextBossName', ''),

    withState('boss_phone', 'setBossPhone', ''),
    withState('stateErrorBossPhone', 'setStateErrorBossPhone', false),
    withState('helperTextBossPhone', 'setHelperTextBossPhone', ''),

    withState('boss_email', 'setBossEmail', ''),
    withState('stateErrorBossEmail', 'setStateErrorBossEmail', false),
    withState('helperTextBossEmail', 'setHelperTextBossEmail', ''),

    withState('boss_address', 'setBossAddres', ''),
    withState('stateErrorBossAddress', 'setStateErrorBossAddress', false),
    withState('helperTextBossAddress', 'setHelperTextBossAddress', ''),
    withState('conditionText', 'setConditionText', ''),
    withState('argeeCond', 'setArgeeCond', false),

    withState('calContent', 'setCalContent', ''),
    withState('stateErrorCalc', 'setStateErrorCalc', false),
    withState('helperTextCalc', 'setHelperTextCalc', ''),
    withState('calResult', 'setCalResult', ''),

    withState('processing', 'setProcessing', false),
    withState('flagChange', 'setFlagChange', false),

    //-- for ref focus
    withState('pharNmFocus', 'setFarNmFocus', null),
    withState('licenceFocus', 'setLicenceFocus', null),
    withState('licenceDtFocus', 'setLicenceDtFocus', null),
    withState('licencePlFocus', 'setLicencePlFocus', null),
    withState('pharAddrFocus', 'setPharAddrFocus', null),
    withState('bossPharFocus', 'setBossPharFocus', null),
    withState('bossPhoneFocus', 'setBossPhoneFocus', null),
    withState('bossEmailFocus', 'setBossEmailFocus', null),
    withState('bossAddrFocus', 'setBossAddrFocus', null),
    withState('calcFocus', 'setCalcFocus', null),

    withHandlers({
        //-- start for ref focus
        handlePharNmRef: (props) => (element) => {
            props.setFarNmFocus(element)
        },
        handleLicenceRef: (props) => (element) => {
            props.setLicenceFocus(element)
        },
        handleLicenceDtRef: (props) => (element) => {
            props.setLicenceDtFocus(element)
        },
        handleLicencePlRef: (props) => (element) => {
            props.setLicencePlFocus(element)
        },
        handlePharAddrRef: (props) => (element) => {
            props.setPharAddrFocus(element)
        },
        handleBossNmRef: (props) => (element) => {
            props.setBossPharFocus(element)
        },
        handleBossPhoneRef: (props) => (element) => {
            props.setBossPhoneFocus(element)
        },
        handleBossEmailRef: (props) => (element) => {
            props.setBossEmailFocus(element)
        },
        handleBossAddrRef: (props) => (element) => {
            props.setBossAddrFocus(element)
        },
        handleCalcRef: (props) => (element) => {
            props.setCalcFocus(element)
        },
        //-- end for ref focus
        changePharmacyName: (props) => (event) => {
            const { t } = props
            props.setHelperTextPharmacyName(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorPharmacyName(event.target.value === '' ? true : false)
            props.setPharmacyName(event.target.value)
        },

        changeLicence: (props) => (event) => {
            const { t } = props
            props.setHelperTextLicence(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorLicence(event.target.value === '' ? true : false)
            props.setLicence(event.target.value)
        },

        changeLicenceDate: (props) => (event) => {
            const { t } = props
            props.setHelperTextLicenceDT(event === '' ? t('message.required') : '')
            props.setStateErrorLicenceDT(event === '' ? true : false)
            console.log('date', event)
            props.setLicenceDate(event)
        },

        changeLicencePlace: (props) => (event) => {
            const { t } = props
            props.setHelperTextLicencePL(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorLicencePL(event.target.value === '' ? true : false)
            props.setLicencePlace(event.target.value)
        },

        changeAddress: (props) => (event) => {
            const { t } = props
            props.setHelperTextAddress(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorAddress(event.target.value === '' ? true : false)
            props.setAddress(event.target.value)
            props.setBossAddres(event.target.value)
        },

        changeBossName: (props) => (event) => {
            const { t } = props
            props.setHelperTextBossName(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorBossName(event.target.value === '' ? true : false)
            props.setBossName(event.target.value)
        },

        changeBossPhone: (props) => (event) => {
            const { t } = props
            props.setHelperTextBossPhone(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorBossPhone(event.target.value === '' ? true : false)
            props.setBossPhone(event.target.value)
        },

        changeBossEmail: (props) => (event) => {
            const { t } = props
            const email = event.target.value
            let check = glb_sv.validateEmail(email)
            let msg = ''
            if (!email || email.trim() === '') {
                msg = t('message.required')
            } else if (!check) {
                msg = t('regist.emailIncorrect')
            }
            props.setHelperTextBossEmail(msg)
            props.setStateErrorBossEmail(!check)
            props.setBossEmail(event.target.value)
        },

        changeBossAddress: (props) => (event) => {
            const { t } = props
            props.setHelperTextBossAddress(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorBossAddress(event.target.value === '' ? true : false)
            props.setBossAddres(event.target.value)
        },

        changeCalResult: (props) => (event) => {
            const { t } = props
            props.setHelperTextCalc(event.target.value === '' ? t('message.required') : '')
            props.setStateErrorCalc(event.target.value === '' ? true : false)
            props.setCalResult(event.target.value)
        },

        handleCheckCond: (props) => (event) => {
            props.setArgeeCond(!props.argeeCond)
        },

        registFunct: (props) => (event) => {
            event.preventDefault()
            regist(props)
        },
    }),

    lifecycle({
        componentDidMount() {
            this.props.setFlagChange(true)
            setTimeout(() => {
                this.props.setConditionText(
                    'Đây là phần mềm miễn phí. Chúng tôi không chịu trách nhiệm và có quyền miễn trừ trách nhiệm trong các trường hợp bất khả kháng bao gồm cả các nguyên nhân khách quan và chủ quan như: chiến tranh, hỏa hoạn..., bị virus, hacker tấn công... hoặc sự cố về cơ sở hạ tầng (server, đường truyền,...) cũng như khả năng kinh phí và nhân lực để duy trì sự hoạt động của dịch vụ.'
                )
                this.props.setCalContent(makeRandom())
                if (this.props.pharNmFocus) this.props.pharNmFocus.focus()
            }, 200)

            subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe((message) => {
                if (message) {
                    const cltSeqResult = message['REQUEST_SEQ']
                    if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                        return
                    }
                    const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                    if (reqInfoMap == null || reqInfoMap === undefined) {
                        return
                    } else if (reqInfoMap.reqFunct === glb_sv.regist_FcntNm) {
                        registResult(this.props, message, cltSeqResult, reqInfoMap)
                    }
                }
            })
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(RegistView))
