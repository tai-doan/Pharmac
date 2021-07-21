export class requestInfo {
    constructor() {
        this.reqTime = new Date(); //-- Thời gian khi cient gửi request
        this.resTime = new Date(); //-- Thời gian khi nhận được phản hồi từ server
        this.reqFunct = null; //-- Tên function chức năng
        this.receiveFunct = null; // handle respone request
        this.procStat = 0;  //-- 0 - Chưa nhận được phản hồi từ server; 
                            // 1 - đã nhận nhưng chưa hoàn tất (trong trường hợp server trả dữ liệu làm nhiều lần mà client chưa nhận được gói cuối cùng)
                            // 2 - đã nhận hoàn tất (gói dữ liệu cuối cùng, lúc này server trả về: message["PACKAGE_END"] == true)
                            // 4 - trạng thái đánh dấu cho biết request này bị timeout
        this.resSucc = true; // -- Kết quả server xử lý yêu cầu thành công hay thất bại
        this.inputParam = []; //-- Ghi nhận lại tham số input được gửi xuống server
        this.timeOutKey = ''
    }
}
