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

import ProductTypeView from './ProductTypeView'
import SnackBarService from '../../utils/service/snackbar_service'

import glb_sv from '../../utils/service/global_service'
import socket_sv from '../../utils/service/socket_service'
import { inputPrmRq } from '../../utils/models/inputPrmRq'
import { requestInfo } from '../../utils/models/requestInfo'

//-- Khai báo cac biến của một hàm Product ở đây
let product_SendReqFlag = false //-- cờ đánh dấu các bước xử lý (từ khi gửi request xuống server, tới khi nhận được phản hồi or tới khi time out)
let product_ProcTimeOut //-- đối tượng control timeout, sẽ được clear nếu nhận được phản hồi từ server trước 15s
let subcr_ClientReqRcv //-- Đối tượng subscribe (ghi nhận) phản hồi từ server
//-- function subcrible event that server result

const subscrFunction = (props) => {
    subcr_ClientReqRcv = socket_sv.event_ClientReqRcv.subscribe((message) => {
        glb_sv.logMessage('Receive Product result: ' + JSON.stringify(message))

        if (message) {
            const cltSeqResult = message['REQUEST_SEQ']
            if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                return
            }
            const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
            glb_sv.logMessage('reqInfoMap result: ' + JSON.stringify(reqInfoMap))
            if (reqInfoMap == null || reqInfoMap === undefined) {
                return
            } else if (reqInfoMap.reqFunct === glb_sv.product_type_FcntNm) {
                ProductResult(props, message, cltSeqResult, reqInfoMap)
            } /*else if (reqInfoMap.reqFunct === this.reset_FunctNm) {
                this.resetResult(message, cltSeqResult, reqInfoMap);
            }*/
        }
    })
}
//-- gửi request xuống server --
const getListProduct = (props) => {}

//-- xử lý kết quả server trả về ---
const ProductResult = (props, message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (props, cltSeq = 0) => {}

const enhance = compose(
    withHandlers({}),

    lifecycle({
        componentDidMount() {
            getListProduct(this.props)
            subscrFunction(this.props)
        },

        componentWillUnmount() {
            if (subcr_ClientReqRcv) subcr_ClientReqRcv.unsubscribe()
        },
    })
)

export default withTranslation()(enhance(ProductTypeView))
