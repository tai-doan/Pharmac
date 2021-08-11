import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'

import glb_sv from '../../utils/service/global_service'
import control_sv from '../../utils/service/control_services'
import SnackBarService from '../../utils/service/snackbar_service'
import reqFunction from '../../utils/constan/functions'
import sendRequest from '../../utils/service/sendReq'

import { initPharmacyInfo, formatCurrency } from './initPharmacyInfo.modal'
import moment from 'moment';
import { Avatar, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    large: {
        width: theme.spacing(15),
        height: theme.spacing(15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto'
    }
}))


const serviceInfo = {
    GET_PHARMACY_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PHARMACY_BY_ID,
        biz: 'admin',
        object: 'pharmacy'
    }
}

const Export_Bill = ({ headerModal, detailModal, className, componentRef }) => {
    const { t } = useTranslation()
    const classes = useStyles()
    const [pharmacyInfo, setPharmacyInfo] = useState(initPharmacyInfo)

    useEffect(() => {
        handleRefresh()
    }, [])

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [glb_sv.pharId], handleResultGetPharmarcyByID, true, handleTimeOut)
    }

    const handleResultGetPharmarcyByID = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let data = {
                name: newData?.rows[0]?.o_2,
                address: newData?.rows[0]?.o_5,
                boss_name: newData?.rows[0]?.o_9,
                boss_phone: newData?.rows[0]?.o_10,
                boss_email: newData?.rows[0]?.o_11,
                logo_name: newData?.rows[0]?.o_12
            }
            setPharmacyInfo(data)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    return (
        <div className={className} ref={componentRef}>
            <div className='print-container'>
                <div className='page-break'>
                    <style>
                        {`
                                @page{
                                    margin:1cm;
                                    size:A4
                                }`}
                    </style>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '20px' }}>
                        <div style={{ textAlign: 'center', margin: 'auto' }} >
                            <Avatar alt='Logo' src={'http://171.244.133.198:5555/upload/comp_logo/' + pharmacyInfo.logo_name} className={classes.large} />
                            <h2 style={{ fontSize: '15pt', marginTop: '1rem' }} >
                                <b>
                                    {t('pharma')} : {pharmacyInfo.name}
                                </b>
                            </h2>
                            <h4 style={{ fontSize: '13pt' }}>
                                {
                                    `${pharmacyInfo.address} - ${pharmacyInfo.boss_phone}`
                                }
                            </h4>
                            {/* <h4 style={{ fontSize: '12pt' }}>
                                <b>
                                    {`${t('pharmacy.boss_name')}: ${pharmacyInfo.boss_name} | 
                                        ${t('pharmacy.boss_phone')}: +${pharmacyInfo.boss_phone} | 
                                            ${t('pharmacy.boss_email')}: ${pharmacyInfo.boss_email}`}
                                </b>
                            </h4> */}
                        </div>
                    </div>
                    <div>
                        <h2 style={{ marginTop: '20px', fontSize: '30pt', textAlign: 'center' }}><b>{t('invoice')}</b></h2>
                    </div>
                    <div style={{ fontSize: '12pt', marginLeft: '10px' }}>
                        <span style={{ marginTop: '20px' }}><b>{t('invoice_code')}: </b>{headerModal.invoice_no}</span>
                        <br />
                        <span style={{ marginTop: '20px', textAlign: 'right' }}><b>{t('date')}: </b>{moment(headerModal.order_dt).format('DD/MM/YYYY')}</span>
                        <br />
                        <span style={{ marginTop: '20px', textAlign: 'right' }} ><b>{t('menu.customer')}: </b>{headerModal.customer ? headerModal.customer : ''}</span>
                    </div>
                    <div>
                        <table className='invoice-fixed-print tableOrder' style={{ fontSize: '10pt' }}>
                            <thead style={{ fontSize: '11pt', textAlign: 'center' }}>
                                <tr>
                                    <th style={{ width: '8%' }}>#</th>
                                    <th style={{ width: '28%' }} >{t('product.name')}</th>
                                    <th style={{ width: '10%' }} >{t('report.lot_no')}</th>
                                    <th style={{ width: '10%' }} >{t('order.export.exp_tp_nm')}</th>
                                    <th style={{ width: '8%' }} >{t('qty')}</th>
                                    <th style={{ width: '10%' }} >{t('unit')}</th>
                                    <th style={{ width: '10%' }} >{t('report.export_order.price')}</th>
                                    <th style={{ width: '8%' }} >{t('report.discount_per')}</th>
                                    <th style={{ width: '8%' }} >{t('report.vat_per')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailModal.length > 0 ? detailModal.map((details, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <tr key={index + 1} style={{ borderBottom: '1px solid #dfdfdf', padding: '5px 0px' }}>
                                                <td className='number' style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                                    {index + 1}
                                                </td>
                                                <td style={{ border: 0 }}>
                                                    {!!details.o_5 ? details.o_5 : ''}
                                                </td>
                                                <td className='' style={{ textAlign: 'right' }}>
                                                    {!!details.o_6 ? details.o_6 : ''}
                                                </td>
                                                <td className='' style={{ textAlign: 'right' }}>
                                                    {!!details.o_3 ? details.o_3 : ''}
                                                </td>
                                                <td className='number' style={{ textAlign: 'right' }}>
                                                    {!!details.o_7 ? details.o_7 : ''}
                                                </td>
                                                <td className='' style={{ textAlign: 'right' }}>
                                                    {!!details.o_9 ? details.o_9 : ''}
                                                </td>
                                                <td className='number' style={{ textAlign: 'right' }}>
                                                    {formatCurrency(!!details.o_10 ? details.o_10 : '')}
                                                </td>
                                                <td className='number' style={{ textAlign: 'right' }}>
                                                    {formatCurrency(!!details.o_11 ? details.o_11 : '')}
                                                </td>
                                                <td className='number' style={{ textAlign: 'right' }}>
                                                    {formatCurrency(!!details.o_12 ? details.o_12 : '')}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                }) : <tr></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ position: 'absolute', right: 0, display: 'flex', flexDirection: 'row', marginLeft: '10px', marginTop: 15 }}>
                        <span style={{ fontSize: '12pt', marginRight: '1rem' }}>
                            <span><b>{t('order.export.invoice_val')}</b></span><br />
                            <span><b>{t('order.export.invoice_discount')}</b></span><br />
                            <span><b>{t('order.export.invoice_vat')}</b></span><br />
                            <span><b>{t('order.export.invoice_needpay')}</b></span><br />
                        </span>
                        <span style={{ textAlign: 'right', marginLeft: '2px', fontSize: '12pt' }}>
                            <span>{formatCurrency(detailModal.reduce(function (acc, obj) {
                                return acc + Math.round(obj.o_7 * obj.o_10)
                            }, 0) || 0) + t('currency')}</span><br />
                            <span>{headerModal.invoice_discount ? formatCurrency(headerModal.invoice_discount) + t('currency') : ''}</span><br />
                            <span>{headerModal.invoice_vat ? formatCurrency(headerModal.invoice_vat) + t('currency') : ''}</span><br />
                            <span>{headerModal.invoice_val ? formatCurrency(headerModal.invoice_val) + t('currency') : ''}</span><br />
                        </span>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Export_Bill

