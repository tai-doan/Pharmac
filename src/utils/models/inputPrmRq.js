import glb_sv from '../service/global_service'
export class inputPrmRq {
    constructor() {
        this.pharId = glb_sv.pharId || 99
        this.branchId = glb_sv.branchId || 0
        this.userId = glb_sv.userId || 'system' // -- userId
        this.authenInfo = 'none' // -- prod
        this.reqFunct = ''
        // this.authenInfo = 'Cq5m1D2p6z7ZpM42cu2mdl1D6A2!1-test'; // -- dev
        this.timeOut = 15
        this.lang = 'vi'
        this.clientSeq = 0
        this.clientChanel = '01' //-- web client, 02 mobile web client, 03 android + ios app
        this.clientSentTime = new Date()
        this.biz = ''
        this.object = ''
        this.funct = ''
        this.input = []
    }
}
