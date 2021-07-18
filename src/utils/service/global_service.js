import { requestInfo } from '../models/requestInfo'
import { Subject } from 'rxjs'
import SnackBarService from './snackbar_service'
import moment from 'moment';

class globalService {
    constructor() {
        this.reqInfoMap = new Map()
        // this.debugYn = false; // -- prod
        this.debugYn = true // -- dev
        // this.sslMode = true; // -- prod
        this.sslMode = false // -- dev
        this.authFlag = true

        this.checkFullScreen = false
        // this.developeFlag = false // -- prod
        this.developeFlag = true // -- dev
        this.urlMobile = 'http://171.244.133.198:8081' // -- prod8081
        this.isMobile = false
        this.mobileTp = ''
        this.userSt = 0
        this.userId = ''
        this.pharId = 106
        this.branchId = 0
        this.pharNm = ''
        this.pharAddr = ''
        this.branch_nm = ''
        this.branch_add = ''
        this.branch_phone = ''
        this.logo_nm = ''
        this.pharTele = ''
        this.userNm = ''
        this.userEmail = ''
        this.userLev = ''
        this.activeBiz = 0
        this.langCrt = 'vi'
        // --------------------------------
        this.commonEvent = new Subject()
        this.insIdExp = 'ID_EXP_IVC'
        this.insIdExpCal = 'ID_EXPCAL_IVC'
        this.insIdImp = 'ID_IMP_IVC'
        this.setExpand = 'setExpand'
        // -- golobal variable
        this.timeoutNumber = 10000
        this.defaultValueSearch = 999999999999
        this.objShareGlb = {} // -- for share info all component of object
        // -- common method share
        this.configInfo = {}
        // this.configInfo["0101X10"] = "2ewr22sd2sadf23Dds"; // -- prod
        this.configInfo['0101X10'] = '2342ds3d3Dss' // -- dev

        // -------------------------------
        this.setReqInfoMapValue = (key = 0, valObj = new requestInfo()) => {
            this.reqInfoMap.set(key, valObj)
        }

        /**
         * get values of an request info from reqInfoMap
         * if key exist => update value, else insert new node
         *
         * @param key = 0 => Client sequence
         * @param valObj => Request infomation object
         *
         * @throws
         * @author Butler - 2021/03/08
         * @return if key is not exist => return undefined, else return an object value
         */
        this.getReqInfoMapValue = (key = 0) => {
            return this.reqInfoMap.get(key)
        }

        this.getUserInfo = () => {
            return sessionStorage.getItem('COM0002')
        }

        this.getlang = () => {
            let lang = sessionStorage.getItem('Lang')
            if (lang === null || lang === undefined) lang = 'vi'
            return lang
        }

        this.logMessage = (message = '') => {
            if (this.debugYn) {
                const now = new Date()
                console.log(`${now.toLocaleTimeString()}.${now.getMilliseconds()}> ${message}`)
            }
        }

        /**
         * Function for remove special character which make parejson error!
         *
         * @param string that need to solve
         *
         * @throws Maybe it make to loss some characters whatever!
         * @author Butler - 2021/03/08
         * @return string after solved
         */
        this.filterStrBfParse = (str = '') => {
            let result = ''
            for (let i = 0; i < str.length; i++) {
                let tt = str.substr(i, 1)
                const ascII = tt.charCodeAt(0)
                if (ascII <= 31 || ascII === 92) {
                    tt = ''
                }
                result = result + tt
            }
            return result
        }

        this.getFirstDayOfWeek_Date = () => {
            const now = new Date()
            const day = now.getDay()
            const diff = now.getDate() - day + (day === 0 ? -6 : 1)
            return new Date(now.setDate(diff))
        }

        this.getToDay2String = (format = '') => {
            const datenow = new Date()
            const y = datenow.getFullYear()
            const d = datenow.getDate()
            const m = datenow.getMonth() + 1
            let dd = '',
                mm = '',
                result = ''
            if (d < 10) {
                dd = '0' + d
            } else {
                dd = d + ''
            }
            if (m < 10) {
                mm = '0' + m
            } else {
                mm = m + ''
            }
            if (format.toLowerCase() === 'ddmmyyyy') {
                result = dd + mm + y
            } else if (format.toLowerCase() === 'yyyymmdd') {
                result = y + mm + dd
            } else {
                result = ''
            }
            return result
        }

        this.convertDate2String = (dt = new Date(), strFormat = '') => {
            if (dt === null || dt === undefined) {
                return ''
            }
            let day = dt.getDate() + ''
            let month = dt.getMonth() + 1 + ''
            const year = dt.getFullYear() + ''
            if (
                day === null ||
                day === undefined ||
                day === '' ||
                day === 'NaN' ||
                month === null ||
                month === undefined ||
                month === '' ||
                month === 'Nan' ||
                year === null ||
                year === undefined ||
                year === '' ||
                year === 'NaN'
            ) {
                return ''
            }
            const pad = '00'
            day = pad.substring(0, pad.length - day.length) + day
            month = pad.substring(0, pad.length - month.length) + month
            let dtStr = ''
            if (strFormat.toLowerCase() === 'yyyymmdd') {
                dtStr = year + month + day
            } else {
                dtStr = day + month + year
            }
            return dtStr
        }

        this.fullScreen = (skip = true, selector = 'body') => {
            this.checkFullScreen = skip
            if (skip) document.querySelector(selector).requestFullscreen()
            else document.exitFullscreen()
        }

        this.filterNumber = (numberstr) => {
            if (typeof numberstr === 'number') {
                return numberstr
            }
            if (typeof numberstr === 'string') {
                if (numberstr != null && numberstr !== undefined && numberstr.length > 0) {
                    return Number(numberstr.replace(/\D/g, ''))
                }
            }
            return null
        }
        this.formatDate = (value, formatIn, formatOut) => {
            if (!value || value === '' || value === null) return ''
            let date = moment(value, formatIn || 'DDMMYYYYHHmmss').format(formatOut ? formatOut : 'DD/MM/YYYY HH:mm:ss')
            if (date === 'Invalid Date') return ''
            return date
        }

        this.formatValue = (value, type) => {
            switch (type) {
                case 'number':
                    var number = new Intl.NumberFormat()
                    return number.format(value)
                case 'currency':
                    var number = new Intl.NumberFormat()
                    return number.format(value)
                case 'date':
                    return this.formatDate(value)
                case 'dated':
                    return this.formatDate(value, 'YYYYMMDD', 'DD/MM/YYYY')
                default:
                    return value
            }
        }

        /**
         * Function to get random interger number in range min and max
         *
         * @param min = 0 min value
         * @param max = 0 max value
         *
         * @throws ..
         * @author Butler - 2021/03/08
         * @return random number
         */
        this.getRandomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min
        }

        this.compareArray = (array1, array2) => {
            if (!array1 || !array2) {
                return false
            }

            // compare lengths
            if (array1.length !== array2.length) {
                return false
            }
            let i = 0
            const l = array1.length
            for (i = 0; i < l; i++) {
                // Check if we have nested arrays
                if (array1[i] instanceof Array && array2[i] instanceof Array) {
                    // recurse into the nested arrays
                    if (!array1[i].equals(array2[i])) {
                        return false
                    }
                } else if (array1[i] !== array2[i]) {
                    // Warning - two different object instances will never be equal: {x:20} != {x:20}
                    return false
                }
            }
            return true
        }

        this.findObjInArray = (arr, fielNm = '', value) => {
            if (arr instanceof Array) {
                let i = 0
                for (i = 0; i < arr.length; i++) {
                    const realVal = arr[i][fielNm]
                    if (!!realVal) {
                        if (realVal === value) {
                            return arr[i]
                        }
                    }
                }
            }
            return null
        }

        this.getRandomArbitrary = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min
        }

        this.validateEmail = (email) => {
            const expression = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
            return expression.test(email.toLowerCase())
        }
    }
}

const theInstance = new globalService()

export default theInstance
