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

const Import_Inventory_Bill = ({ headerModal, detailModal, className }) => {
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
                    </div>
                    <div>
                        <table className='invoice-fixed-print' style={{ fontSize: '10pt', width: '66mm' }}>
                            <tbody style={{ fontSize: '11pt', textAlign: 'center' }}>
                                <tr>
                                    <th style={{ width: '8%' }}>#</th>
                                    <th style={{ width: '28%' }} >{t('product.name')}</th>
                                    <th style={{ width: '10%' }} >{t('report.lot_no')}</th>
                                    <th style={{ width: '10%' }} >{t('report.inventory.exp_dt')}</th>
                                    <th style={{ width: '8%' }} >{t('qty')}</th>
                                    <th style={{ width: '10%' }} >{t('unit')}</th>
                                    <th style={{ width: '10%' }} >{t('report.import_order.price')}</th>
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
                                                    {!!details.o_4 ? details.o_4 : ''}
                                                </td>
                                                <td className='' style={{ textAlign: 'right' }}>
                                                    {!!details.o_5 ? details.o_5 : ''}
                                                </td>
                                                <td className='' style={{ textAlign: 'right' }}>
                                                    {!!details.o_7 ? moment(details.o_6, 'YYYYMMDD').format('DD/MM/YYYY') : ''}
                                                </td>
                                                <td className='number' style={{ textAlign: 'right' }}>
                                                    {!!details.o_8 ? details.o_8 : ''}
                                                </td>
                                                <td className='' style={{ textAlign: 'right' }}>
                                                    {!!details.o_10 ? details.o_10 : ''}
                                                </td>
                                                <td className='number' style={{ textAlign: 'right' }}>
                                                    {formatCurrency(!!details.o_11 ? details.o_11 : '')}
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
                            <span><b>{t('export.invoice_needpay')}</b></span><br />
                        </span>
                        <span style={{ textAlign: 'right', marginLeft: '2px', fontSize: '16pt' }}>
                            <span>{headerModal.o_5 ? headerModal.o_5 : 0}</span><br />
                            <span>{headerModal.o_5 ? formatCurrency(headerModal.o_5) + t('currency') : ''}</span><br />
                        </span>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Import_Inventory_Bill

