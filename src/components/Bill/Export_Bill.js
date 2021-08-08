import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

import { initPharmacyInfo, formatCurrency } from './initPharmacyInfo.modal'
import moment from 'moment';

const serviceInfo = {
    GET_PHARMACY_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PHARMACY_BY_ID,
        biz: 'admin',
        object: 'pharmacy'
    }
}

const Export_Bill = ({ headerModal, detailModal, className }) => {
    const { t } = useTranslation()
    const [pharmacyInfo, setPharmacyInfo] = useState(initPharmacyInfo)

    useEffect(() => {
        handleRefresh()
    }, [])

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [glb_sv.pharId], handleResultGetPharmarcyByID, true, handleTimeOut)
    }

    const handleResultGetPharmarcyByID = (reqInfoMap, message) => {
        setProcess(false)
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
        <div className={className}>
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
                            <h2 style={{ fontSize: '20pt' }} >
                                <b>
                                    {pharmacyInfo.name}
                                </b>
                            </h2>
                            <h4 style={{ fontSize: '18pt' }}>
                                {
                                    `${pharmacyInfo.address}`
                                }
                            </h4>
                            <h4 style={{ fontSize: '18pt' }}>
                                <b>
                                    {`${t('pharmacy.boss_name')}: +${pharmacyInfo.boss_name} | 
                                        ${t('pharmacy.boss_phone')}: +${pharmacyInfo.boss_phone} | 
                                            ${t('pharmacy.boss_email')}: +${pharmacyInfo.boss_email}`}
                                </b>
                            </h4>
                        </div>
                    </div>
                    <div>
                        <h2 style={{ marginTop: '20px', fontSize: '30pt', textAlign: 'center' }}><b>{T('invoice')}</b></h2>
                    </div>
                    <div style={{ fontSize: '16pt', marginLeft: '10px' }}>
                        <span style={{ marginTop: '20px' }}><b>{t('invoice_code')}: </b>{headerModal.o_2}</span>
                        <br />
                        <span style={{ marginTop: '20px', textAlign: 'right' }}><b>{t('date')}: </b>{moment(headerModal.o_6, 'YYYYMMDD').format('DD/MM/YYYY')}</span>
                        <br />
                        <span style={{ marginTop: '20px', textAlign: 'right' }} ><b>{t('menu.customer')}: </b>{headerModal.o_5 ? headerModal.o_5 : ''}</span>
                    </div>
                    <div>
                        <table className='invoice-fixed-print' style={{ fontSize: '10pt', width: '66mm' }}>
                            <tbody style={{ fontSize: '11pt', textAlign: 'center' }}>
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
                            </tbody>
                            <tbody>
                                {detailModal.length > 0 ? detailModal.map((details, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <tr key={index + 1}>
                                                <td className='number' rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'top' }}>
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
                    <div style={{ position: 'absolute', right: 30, display: 'flex', flexDirection: 'row', marginLeft: '10px' }}>
                        <span style={{ fontSize: '16pt' }}>
                            <span><b>{t('export.invoice_val')}</b></span><br />
                            <span><b>{t('export.invoice_discount')}</b></span><br />
                            <span><b>{t('export.invoice_vat')}</b></span><br />
                            <span><b>{t('export.invoice_needpay')}</b></span><br />
                        </span>
                        <span style={{ textAlign: 'right', marginLeft: '2px', fontSize: '16pt' }}>
                            <span>{headerModal.o_12 ? headerModal.o_12 : 0}</span><br />
                            <span>{headerModal.o_13 ? formatCurrency(headerModal.o_13) + t('currency') : ''}</span><br />
                            <span>{headerModal.o_14 ? formatCurrency(headerModal.o_14) + t('currency') : ''}</span><br />
                            <span>{headerModal.o_12 ? formatCurrency(headerModal.o_12) + t('currency') : ''}</span><br />
                        </span>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Export_Bill

