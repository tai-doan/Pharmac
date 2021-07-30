import React, { useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, SvgIcon, Tooltip } from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportDestroyModal } from './Modal/ExportDestroy.modal'
import LotNoByProduct_Autocomplete from '../../../components/LotNoByProduct';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

const serviceInfo = {
    GET_PRICE_BY_PRODUCT_ID: {
        functionName: 'get_by_prodid',
        reqFunct: reqFunction.EXPORT_BY_ID,
        biz: 'common',
        object: 'setup_price'
    },
    GET_PRODUCT_BY_BARCODE: {
        functionName: 'get_imp_info',
        reqFunct: reqFunction.GET_PRODUCT_BY_BARCODE,
        biz: 'common',
        object: 'products'
    }
}

const AddProduct = ({ onAddProduct, resetFlag }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportDestroyModal })
    const [productOpenFocus, setProductOpenFocus] = useState(false)
    const [isInventory, setIsInventory] = useState(true)
    const [priceList, setPriceList] = useState([])
    const [selectLotNoFlag, setSelectLotNoFlag] = useState(false)
    const [barcodeScaned, setBarcodeScaned] = useState('')
    const [isScan, setIsScan] = useState(false)
    const inputBarcodeRef = useRef(null)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)
    const stepFiveRef = useRef(null)
    const stepSixRef = useRef(null)

    useEffect(() => {
        if (resetFlag) {
            setProductInfo({ ...productExportDestroyModal })
            stepOneRef.current.focus()
        }
    }, [resetFlag])

    useEffect(() => {
        if (selectLotNoFlag && productInfo.prod_id) {
            setPriceList([])
            sendRequest(serviceInfo.GET_PRICE_BY_PRODUCT_ID, [productInfo.prod_id], handleResultGetPrice, true, handleTimeOut)
        }
    }, [selectLotNoFlag])

    const handleSelectProduct = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        newProductInfo['lot_no'] = null
        newProductInfo['quantity_in_stock'] = ''
        if (!!obj) {
            stepThreeRef.current.focus()

            // bắn event lấy thông tin cấu hình bảng giá => nhập fill vào các ô dưới
        }
        setProductOpenFocus(false)
        setProductInfo(newProductInfo)
    }

    const handleResultGetPrice = (reqInfoMap, message) => {
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA']
            setPriceList(data.rows)
            if (data.rows.length > 0) {
                let itemMinUnit = data.rows.find(x => x.o_4 === productInfo?.unit_id)
                const newProductInfo = { ...productInfo };
                if (itemMinUnit) {
                    // bảng giá đã config giá nhỏ nhất
                    newProductInfo['price'] = itemMinUnit.o_9// invoiceType ? itemMinUnit.o_8 : itemMinUnit.o_9
                    setProductInfo(newProductInfo)
                } else {
                    // bảng giá chưa config giá nhỏ nhất
                    newProductInfo['unit_id'] = data.rows[0].o_4;
                    newProductInfo['price'] = data.rows[0].o_9// invoiceType ? data.rows[0].o_8 : data.rows[0].o_9
                    setProductInfo(newProductInfo)
                }
            } else {
                const newProductInfo = { ...productInfo };
                newProductInfo['price'] = 0
                setProductInfo(newProductInfo)
            }
        }
    }

    const handleSelectUnit = obj => {
        const newProductInfo = { ...productInfo };
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
        const priceData = priceList.find(x => x.o_4 === obj.o_1)
        if (priceData) {
            newProductInfo['price'] = priceData.o_9
        } else {
            newProductInfo['price'] = 0
        }
        setProductInfo(newProductInfo)
    }

    const handleQuantityChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['qty'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = value => {
        const newProductInfo = { ...productInfo };
        newProductInfo['price'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handleSelectLotNo = object => {
        const newProductInfo = { ...productInfo };
        newProductInfo['quantity_in_stock'] = !!object ? object.o_5 : null
        newProductInfo['lot_no'] = !!object ? object.o_3 : null
        newProductInfo['unit_id'] = !!object ? object.o_7 : null
        newProductInfo['exp_dt'] = !!object ? object.o_4 : null
        setProductInfo(newProductInfo)
        setSelectLotNoFlag(true)
        setTimeout(() => {
            setSelectLotNoFlag(false)
        }, 100);
    }

    const handleChange = e => {
        const newProductInfo = { ...productInfo };
        newProductInfo[e.target.name] = e.target.value
        setProductInfo(newProductInfo)
    }

    const handleBarCodeChange = e => {
        if (!!e.target.value) {
            console.log('barcode change: ', e.target.value)
            setBarcodeScaned(e.target.value)
            // Gửi event lấy thông tin sp theo barcode
            sendRequest(serviceInfo.GET_PRODUCT_BY_BARCODE, [e.target.value, 'Y'], handleResultGetProductByBarcode, true, handleTimeOut)
        }
    }

    const handleResultGetProductByBarcode = (reqInfoMap, message) => {
        console.log('handleResultGetProductByBarcode: ', reqInfoMap, message)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            setBarcodeScaned('')
            inputBarcodeRef.current.focus()
            // thêm sản phẩm xuống form
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const checkValidate = () => {
        if (!!productInfo.prod_id && !!productInfo.lot_no && productInfo.qty > 0 && !!productInfo.unit_id && productInfo.price >= 0) {
            return false
        }
        return true
    }

    return (
        <Card className='mb-2'>
            <CardHeader
                title={t('order.import.productAdd')}
                action={
                    <>
                        {isScan ?
                            <Tooltip onClick={() => {
                                setIsScan(false);
                            }}
                                title={t('edit_base')}>
                                <SvgIcon viewBox="0 0 172 172" style={{ fill: '#000000' }}>
                                    <g
                                        fill="none"
                                        fillRule="nonzero"
                                        stroke="none"
                                        strokeWidth="1"
                                        strokeLinecap="butt"
                                        strokeLinejoin="miter"
                                        strokeMiterlimit="10"
                                        strokeDasharray=""
                                        strokeDashoffset="0"
                                        fontFamily="none"
                                        fontWeight="none"
                                        fontSize="none"
                                        textAnchor="none"
                                    >
                                        <path d="M0,172v-172h172v172z" fill="none"></path>
                                        <g id="original-icon" fill="#000000">
                                            <path d="M9.675,0c-5.28094,0 -9.675,4.39406 -9.675,9.675v17.2c-0.02687,0.215 -0.02687,0.43 0,0.645v110.08c0,1.89469 1.54531,3.44 3.44,3.44h79.12c1.23625,0.01344 2.39188,-0.63156 3.02344,-1.70656c0.61813,-1.075 0.61813,-2.39187 0,-3.46687c-0.63156,-1.075 -1.78719,-1.72 -3.02344,-1.70656h-75.68v-103.2h137.6v44.72c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-48.16c0.02688,-0.215 0.02688,-0.43 0,-0.645v-17.2c0,-5.28094 -4.39406,-9.675 -9.675,-9.675zM9.675,6.88h132.01c1.59906,0 2.795,1.19594 2.795,2.795v14.405h-137.6v-14.405c0,-1.59906 1.19594,-2.795 2.795,-2.795zM24.08,51.6v6.88h13.76v-6.88zM48.16,51.6v6.88h79.12v-6.88zM24.08,68.8v6.88h13.76v-6.88zM48.16,68.8v6.88h79.12v-6.88zM157.9175,85.6775c-3.61469,0 -7.24281,1.33031 -9.9975,4.085l-2.365,2.4725l0.1075,0.1075l-53.105,53.105c-0.44344,0.40313 -0.77937,0.92719 -0.9675,1.505l-5.805,20.64c-0.34937,1.19594 -0.04031,2.48594 0.83313,3.38625c0.87344,0.88688 2.15,1.23625 3.35937,0.91375l20.64,-5.4825c0.57781,-0.18812 1.10188,-0.52406 1.505,-0.9675l54.395,-53.965c0.41656,-0.34937 0.7525,-0.79281 0.9675,-1.29c0,-0.04031 0,-0.06719 0,-0.1075l0.43,-0.3225c5.50938,-5.50937 5.50938,-14.48562 0,-19.995c-2.75469,-2.75469 -6.38281,-4.085 -9.9975,-4.085zM24.08,86v6.88h13.76v-6.88zM48.16,86v6.88h79.12v-6.88zM150.5,97.18l10.32,10.32l-52.7825,52.46l-10.105,-9.7825l0.1075,-0.43zM24.08,103.2v6.88h13.76v-6.88zM48.16,103.2v6.88h65.36v-6.88z"></path>
                                        </g>
                                    </g>
                                </SvgIcon>
                            </Tooltip>
                            : <Tooltip onClick={() => {
                                setIsScan(true);
                            }}
                                title={t('scan_barcode')}>
                                <SvgIcon viewBox="0 0 172 172" style={{ fill: '#000000' }}>
                                    <g
                                        fill="none"
                                        fillRule="nonzero"
                                        stroke="none"
                                        strokeWidth="1"
                                        strokeLinecap="butt"
                                        strokeLinejoin="miter"
                                        strokeMiterlimit="10"
                                        strokeDasharray=""
                                        strokeDashoffset="0"
                                        fontFamily="none"
                                        fontWeight="none"
                                        fontSize="none"
                                        textAnchor="none"
                                    >
                                        <path d="M0,172v-172h172v172z" fill="none"></path>
                                        <g fill="#000000">
                                            <path d="M106.3175,6.88c-9.15094,0 -14.60656,1.70656 -16.4475,2.15c-1.00781,0.24188 -1.505,0.43 -3.01,0.9675c-1.505,0.5375 -3.52062,1.27656 -5.9125,2.15c-4.77031,1.74688 -10.99187,4.05813 -17.415,6.45c-12.84625,4.77031 -26.39125,9.87656 -30.53,11.5025c-2.21719,0.86 -4.00437,1.67969 -5.4825,2.9025c-1.47812,1.22281 -2.55312,2.96969 -3.01,4.73c-0.91375,3.49375 0.05375,6.5575 0.9675,10.6425v0.1075c0.02688,0.14781 2.0425,11.54281 3.44,16.34c1.35719,4.64938 4.07156,8.21031 8.2775,9.7825c34.14469,12.55063 56.66594,11.395 62.565,11.395c0.215,-0.01344 0.43,-0.05375 0.645,-0.1075c0.45688,-0.09406 0.90031,-0.26875 1.29,-0.5375l0.215,-0.1075c0.08063,-0.06719 0.14781,-0.13437 0.215,-0.215l3.44,-2.2575l0.86,7.955c-0.65844,0.76594 -1.49156,1.81406 -3.225,3.7625c-2.16344,2.43219 -4.60906,4.97188 -5.4825,5.805c-0.08062,0.06719 -0.14781,0.13438 -0.215,0.215c-0.01344,0.01344 -0.09406,0.09406 -0.1075,0.1075c-0.08062,0.06719 -0.14781,0.13438 -0.215,0.215c-0.08062,0.06719 -0.14781,0.13438 -0.215,0.215c0,0.04031 0,0.06719 0,0.1075c-0.08062,0.06719 -0.14781,0.13438 -0.215,0.215c-0.04031,0.1075 -0.08062,0.215 -0.1075,0.3225c-0.09406,0.20156 -0.16125,0.43 -0.215,0.645c0,0.04031 0,0.06719 0,0.1075c-0.04031,0.06719 -0.08062,0.14781 -0.1075,0.215c0,0.04031 0,0.06719 0,0.1075c-0.08062,0.65844 0.02688,1.33031 0.3225,1.935c0.02688,0.14781 0.06719,0.29563 0.1075,0.43l3.3325,10.32c0.40313,1.15563 1.38406,2.01563 2.58,2.2575c0,0 4.03125,0.81969 6.45,1.29c0.22844,2.23063 0.48375,4.50156 0.645,6.1275c0.1075,1.14219 0.14781,2.12313 0.215,2.795c0.02688,0.33594 0.09406,0.57781 0.1075,0.7525c-0.01344,-0.02687 -0.1075,0.26875 -0.645,0.86c-0.71219,0.77938 -1.98875,1.8275 -3.3325,3.1175c-2.70094,2.58 -6.1275,6.38281 -6.1275,11.9325c0,2.67406 1.15563,5.01219 2.58,7.2025c1.42438,2.19031 3.34594,4.23281 5.375,6.1275c2.02906,1.89469 4.16563,3.66844 6.3425,4.945c2.17688,1.27656 4.27313,2.2575 6.7725,2.2575h24.6175c2.74125,0 5.16,-1.35719 7.095,-3.225c1.935,-1.86781 3.5475,-4.27312 4.8375,-7.2025c2.59344,-5.84531 4.085,-13.6525 4.085,-22.575c0,-19.0275 -10.6425,-43.38969 -10.6425,-66.435c0,-6.47687 1.78719,-12.52375 3.3325,-15.265c0.36281,-0.645 0.71219,-1.27656 1.075,-1.8275c0.04031,-0.04031 0.06719,-0.06719 0.1075,-0.1075c0.02688,-0.04031 0.08063,-0.06719 0.1075,-0.1075c0.29563,-0.34937 0.51063,-0.7525 0.645,-1.1825c0.20156,-0.33594 0.44344,-0.55094 0.645,-0.9675c0.86,-1.76031 1.29,-3.95062 1.29,-7.095v-17.5225c0,-4.09844 -2.20375,-7.29656 -4.515,-8.815c-2.31125,-1.51844 -4.54187,-1.81406 -5.4825,-1.935c0.08063,0.01344 -2.06937,-0.26875 -5.0525,-0.645c-2.98312,-0.37625 -6.9875,-0.79281 -11.395,-1.29c-8.815,-0.98094 -19.04094,-2.0425 -25.4775,-2.0425zM106.3175,13.76c5.6975,0 16.00406,0.95406 24.725,1.935c4.36719,0.48375 8.33125,1.02125 11.2875,1.3975c2.95625,0.37625 4.64938,0.59125 5.0525,0.645c0.59125,0.06719 1.77375,0.33594 2.58,0.86c0.80625,0.52406 1.3975,0.92719 1.3975,3.01v17.5225c0,2.55313 -0.28219,3.3325 -0.645,4.085c-0.06719,0.14781 -0.3225,0.57781 -0.43,0.7525l-43.43,29.67c-0.22844,0.12094 -0.44344,0.26875 -0.645,0.43l-3.87,2.58l-3.9775,-27.1975c-0.215,-1.505 -1.3975,-2.6875 -2.9025,-2.9025c-22.50781,-3.5475 -50.71312,-8.72094 -59.4475,-10.32c4.21938,-1.63937 17.28063,-6.50375 29.885,-11.18c6.40969,-2.37844 12.65813,-4.71656 17.415,-6.45c2.37844,-0.87344 4.34031,-1.62594 5.805,-2.15c1.46469,-0.52406 2.83531,-0.87344 2.365,-0.7525c2.45906,-0.59125 6.46344,-1.935 14.835,-1.935zM31.2825,42.355c4.68969,0.87344 36.18719,6.70531 60.63,10.6425l3.87,26.1225c-8.7075,0.06719 -27.03625,-0.24187 -56.2225,-10.965c-2.62031,-0.98094 -3.01,-1.46469 -4.085,-5.16c-1.02125,-3.50719 -3.225,-15.8025 -3.225,-15.8025c-0.02687,-0.06719 -0.06719,-0.14781 -0.1075,-0.215c-0.43,-1.90812 -0.69875,-3.41312 -0.86,-4.6225zM145.34,55.5775c-0.68531,3.07719 -1.1825,6.45 -1.1825,10.105c0,25.07438 10.6425,50.17563 10.6425,66.435c0,8.11625 -1.47812,15.11719 -3.5475,19.78c-1.03469,2.33813 -2.17687,4.04469 -3.225,5.0525c-1.04812,1.00781 -1.80062,1.29 -2.365,1.29h-24.6175c-0.17469,0 -1.72,-0.33594 -3.3325,-1.29c-1.6125,-0.95406 -3.46687,-2.39187 -5.16,-3.9775c-1.69312,-1.58562 -3.17125,-3.37281 -4.1925,-4.945c-1.02125,-1.57219 -1.505,-3.03687 -1.505,-3.44c0,-2.795 1.63938,-4.75687 3.9775,-6.9875c1.16906,-1.11531 2.48594,-2.16344 3.655,-3.44c1.16906,-1.27656 2.4725,-2.94281 2.4725,-5.375c0,-0.51062 0.01344,-0.43 0,-0.645c-0.01344,-0.215 -0.08062,-0.51062 -0.1075,-0.86c-0.06719,-0.69875 -0.1075,-1.65281 -0.215,-2.795c-0.1075,-1.10187 -0.29562,-2.78156 -0.43,-4.1925c3.18469,0.60469 5.89906,1.20938 7.095,1.3975c0.49719,0.08063 1.02125,0.04031 1.505,-0.1075c5.88563,-1.62594 9.46,-6.04687 11.0725,-10.8575c1.53188,-4.52844 1.73344,-9.47344 1.72,-14.19c0.25531,-1.00781 0.05375,-2.08281 -0.57781,-2.92937c-0.63156,-0.83313 -1.59906,-1.34375 -2.64719,-1.37063h-0.5375l-20.64,-3.3325l-1.29,-10.535zM111.37,95.5675l15.265,2.365l-5.805,5.4825l-14.19,-2.58c0.57781,-0.645 1.08844,-1.11531 1.72,-1.8275c1.6125,-1.8275 2.2575,-2.58 3.01,-3.44zM130.1825,104.1675c-0.12094,1.62594 -0.33594,3.14438 -0.7525,4.4075c-1.08844,3.225 -2.6875,5.0525 -6.1275,6.1275c-1.8275,-0.3225 -5.14656,-0.95406 -9.675,-1.8275c-0.29562,-0.05375 -0.34937,-0.05375 -0.645,-0.1075c-0.1075,-0.04031 -0.215,-0.08062 -0.3225,-0.1075c-0.18812,-0.04031 -0.24187,0.04031 -0.43,0c-2.795,-0.5375 -5.2675,-1.10187 -6.235,-1.29l-1.1825,-3.7625l16.4475,2.9025c1.04813,0.17469 2.12313,-0.13437 2.9025,-0.86zM10.32,110.08v41.28h10.32v-41.28zM27.52,110.08v41.28h6.88v-41.28zM41.28,110.08v41.28h10.32v-41.28zM58.48,110.08v41.28h6.88v-41.28z"></path>
                                        </g>
                                    </g>
                                </SvgIcon>
                            </Tooltip>
                        }
                        <FormControlLabel style={{ margin: 0 }}
                            control={<Checkbox style={{ padding: 0 }} checked={isInventory} onChange={e => setIsInventory(e.target.checked)} name="only_get_inventory_lot_no" />}
                            label={t('only_get_inventory_lot_no')}
                        />
                    </>
                }
            />
            <CardContent>
                {isScan ?
                    <Grid container spacing={1}>
                        <Grid item xs={3}>
                            <Tooltip placement="top" title={t('product.tooltip.barcode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('products.product.barcode')}
                                    onChange={handleBarCodeChange}
                                    value={barcodeScaned}
                                    name="barcode"
                                    variant="outlined"
                                    autoFocus={true}
                                    inputRef={inputBarcodeRef}
                                />
                            </Tooltip>
                        </Grid>
                    </Grid>
                    : <>
                        <Grid container spacing={1}>
                            <Grid item xs={3}>
                                <FormControl margin="dense" variant="outlined" className='w-100'>
                                    <InputLabel id="reason_tp">{t('order.exportDestroy.reason_tp')}</InputLabel>
                                    <Select
                                        labelId="reason_tp"
                                        id="reason_tp-select"
                                        value={productInfo.reason_tp || '1'}
                                        onChange={handleChange}
                                        onClose={e => {
                                            setTimeout(() => {
                                                setProductOpenFocus(true)
                                                stepOneRef.current.focus()
                                            }, 0);
                                        }}
                                        label={t('order.exportDestroy.reason_tp')}
                                        name='reason_tp'
                                        inputRef={stepSixRef}
                                    >
                                        <MenuItem value="1">{t('order.exportDestroy.cancel_by_out_of_date')}</MenuItem>
                                        <MenuItem value="2">{t('order.exportDestroy.cancel_by_lost_goods')}</MenuItem>
                                        <MenuItem value="3">{t('order.exportDestroy.cancel_by_inventory_balance')}</MenuItem>
                                        <MenuItem value="4">{t('other_reason')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <Product_Autocomplete
                                    openOnFocus={productOpenFocus}
                                    value={productInfo.prod_nm}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                    inputRef={stepOneRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            stepTwoRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <LotNoByProduct_Autocomplete
                                    isInventory={isInventory}
                                    disabled={!productInfo.prod_id}
                                    productID={productInfo.prod_id}
                                    label={t('order.export.lot_no')}
                                    onSelect={handleSelectLotNo}
                                    inputRef={stepTwoRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            stepThreeRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        disabled={true}
                                        disableToolbar
                                        margin="dense"
                                        variant="outlined"
                                        style={{ width: '100%' }}
                                        inputVariant="outlined"
                                        format="dd/MM/yyyy"
                                        id="exp_dt-picker-inline"
                                        label={t('order.export.exp_dt')}
                                        value={productInfo.exp_dt ? moment(productInfo.exp_dt, 'YYYYMMDD').toString() : null}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item xs>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.store_current')}
                                    value={productInfo.quantity_in_stock || ''}
                                    name='quantity_in_stock'
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.qty}
                                    label={t('order.export.qty')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handleQuantityChange}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    inputRef={stepThreeRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            stepFourRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <Unit_Autocomplete
                                    unitID={productInfo.unit_id || null}
                                    // value={productInfo.unit_nm || ''}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                    inputRef={stepFourRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            stepFiveRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat className='inputNumber'
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.price}
                                    label={t('order.export.price')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handlePriceChange}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    inputRef={stepFiveRef}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            onAddProduct(productInfo);
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item className='d-flex align-items-center'>
                                <Button
                                    onClick={() => {
                                        onAddProduct(productInfo);
                                    }}
                                    variant="contained"
                                    disabled={checkValidate()}
                                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                                >
                                    {t('btn.save')}
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                }
            </CardContent>
        </Card >
    )
}

export default AddProduct;
