import glb_sv from './global_service';

class ControlService {
    constructor() {
        this.ControlTimeOutObj = {}

        this.clearTimeOutRequest = (controlTimeOutKey) => {
            // console.log('Các request đang đợi phản hồi', this.ControlTimeOutObj);
            if (this.ControlTimeOutObj[controlTimeOutKey]) clearTimeout(this.ControlTimeOutObj[controlTimeOutKey])
            delete this.ControlTimeOutObj[controlTimeOutKey]
            // console.log('Clear TimeOut Request: Request đã nhận được phản hồi hoặc bị timeOut ', controlTimeOutKey);
            return
        }
        this.clearReqInfoMapRequest = (clientSeq) => {
            glb_sv.setReqInfoMapValue(clientSeq, null)
            return
        }
    }
}


const theInstance = new ControlService()
export default theInstance