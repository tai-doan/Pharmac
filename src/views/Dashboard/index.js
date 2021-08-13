import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { Card, CardHeader, CardContent, Grid, Select, MenuItem } from '@material-ui/core'

import glb_sv from '../../utils/service/global_service'
import control_sv from '../../utils/service/control_services'
import SnackBarService from '../../utils/service/snackbar_service'
import reqFunction from '../../utils/constan/functions'
import sendRequest from '../../utils/service/sendReq'
import { formatCurrency } from '../../components/Bill/initPharmacyInfo.modal'

import { ReactComponent as IC_MONEY } from '../../asset/images/dashboard-money.svg'
import { ReactComponent as IC_RETURN } from '../../asset/images/dashboard-return.svg'
import { ReactComponent as IC_DESTROY } from '../../asset/images/dashboard-destroy.svg'
import { ReactComponent as IC_IMPORT } from '../../asset/images/dashboard-import.svg'

import DashboardChart from './DashboardChart'
import ProductGroup_Autocomplete from '../Products/ProductGroup/Control/ProductGroup.Autocomplete'

const serviceInfo = {
    REPORT_STATIC: {
        functionName: 'rp_static',
        reqFunct: reqFunction.REPORT_STATIC,
        biz: 'report',
        object: 'rp_statistic'
    },
    REPORT_STATIC_CHART: {
        functionName: 'rpexp_static',
        reqFunct: reqFunction.REPORT_STATIC_CHART,
        biz: 'report',
        object: 'rp_statistic'
    }
}

const DashboardLayout = () => {
    const { t } = useTranslation()
    const [dataReportStatic, setDataReportStatic] = useState({})
    const [dataChart, setDataChart] = useState([])
    const [typeChart, setTypeChart] = useState('1') // '1' là tháng hiện tại - 0 tháng trước

    useEffect(() => {
        sendRequest(serviceInfo.REPORT_STATIC, [], handleResultGetReportStatic, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (typeChart === '1') {
            sendRequest(serviceInfo.REPORT_STATIC_CHART, [moment().startOf('months').format('YYYYMMDD'), moment().format('YYYYMMDD')], handleResultGetChartData, true, handleTimeOut)
        } else {
            sendRequest(serviceInfo.REPORT_STATIC_CHART, [moment().subtract(1, 'months').startOf('months').format('YYYYMMDD'), moment().subtract(1, 'months').endOf('months').format('YYYYMMDD')], handleResultGetChartData, true, handleTimeOut)
        }
    }, [typeChart])

    const handleResultGetChartData = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setDataChart(newData.rows)
        }
    }

    const handleResultGetReportStatic = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setDataReportStatic(newData.rows[0])
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleChange = (event) => {
        setTypeChart(event.target.value);
    }

    return (
        <>
            <Grid container spacing={2}>
                {/** Fake lấy id nhóm sp dược phẩm => check các điều kiện bắt buộc nhập exp date */}
                <div className='d-none'>
                    <ProductGroup_Autocomplete />
                </div>
                <Grid item xs={12} sm={12}>
                    <Card className='mt-2'>
                        <CardHeader title={t('dashboard.total_date')} />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_MONEY />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_1} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--blue)' }}>
                                            {formatCurrency(dataReportStatic.o_2)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_IMPORT />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_7} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--green)' }}>
                                            {formatCurrency(dataReportStatic.o_8)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.import')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_RETURN />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_19} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--orange)' }}>
                                            {formatCurrency(dataReportStatic.o_20)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export_repay')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center'>
                                    <div className='icon'>
                                        <IC_DESTROY />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_13} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--danger)' }}>
                                            {formatCurrency(dataReportStatic.o_14)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export_destroy')}
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card className='mt-2'>
                        <CardHeader title={t('dashboard.total_week')} />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_MONEY />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_3} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--blue)' }}>
                                            {formatCurrency(dataReportStatic.o_4)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_IMPORT />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_9} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--green)' }}>
                                            {formatCurrency(dataReportStatic.o_10)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.import')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_RETURN />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_21} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--orange)' }}>
                                            {formatCurrency(dataReportStatic.o_22)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export_repay')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center'>
                                    <div className='icon'>
                                        <IC_DESTROY />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_15} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--danger)' }}>
                                            {formatCurrency(dataReportStatic.o_16)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export_destroy')}
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card className='mt-2'>
                        <CardHeader title={t('dashboard.total_month')} />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_MONEY />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_5} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--blue)' }}>
                                            {formatCurrency(dataReportStatic.o_6)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_IMPORT />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_11} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--green)' }}>
                                            {formatCurrency(dataReportStatic.o_12)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.import')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center' style={{ borderRight: '1px dashed #373e4c' }}>
                                    <div className='icon'>
                                        <IC_RETURN />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_23} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--orange)' }}>
                                            {formatCurrency(dataReportStatic.o_24)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export_repay')}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={3} className='d-flex align-items-center'>
                                    <div className='icon'>
                                        <IC_DESTROY />
                                    </div>
                                    <div className='content'>
                                        <div className='invoice'>
                                            {dataReportStatic.o_17} {t('dashboard.invoice')}
                                        </div>
                                        <div className='currency' style={{ color: 'var(--danger)' }}>
                                            {formatCurrency(dataReportStatic.o_18)} {t('currency')}
                                        </div>
                                        <div className='title-order'>
                                            {t('dashboard.export_destroy')}
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={12}>
                    <Card>
                        <CardHeader
                            title={t('dashboard.revenue_chart')}
                            action={
                                <div>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={typeChart}
                                        onChange={handleChange}
                                        style={{ color: 'var(--primary)' }}
                                    >
                                        <MenuItem value={'1'}> {t('dashboard.current_month')}</MenuItem>
                                        <MenuItem value={'0'}>{t('dashboard.last_month')}</MenuItem>
                                    </Select>
                                    {/* <Button key='month-0' size='small'
                                        onClick={() => { setTypeChart('0') }}
                                        variant="contained"
                                        className=''
                                    >
                                        {t('dashboard.last_month')}
                                    </Button>
                                    <Button key='month-1' size='small'
                                        onClick={() => { setTypeChart('1') }}
                                        variant="contained"
                                        className='button-loading bg-print text-white'
                                    >
                                        {t('dashboard.current_month')}
                                    </Button> */}
                                </div>
                            } />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={12}>
                                    <DashboardChart data={dataChart} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}

export default DashboardLayout

