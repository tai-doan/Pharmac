import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import FastForwardIcon from '@material-ui/icons/FastForward';
import Chip from '@material-ui/core/Chip';
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, searchDefaultModal } from './Modal/ExportDestroy.modal'
import ExportDestroySearch from './ExportDestroySearch';
import { Card, CardHeader, CardContent, IconButton } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import moment from 'moment'
import { Link } from 'react-router-dom'

const serviceInfo = {
    GET_ALL: {
        functionName: 'exp_destroy_time',
        reqFunct: reqFunction.REPORT_EXPORT_DESTROY,
        biz: 'report',
        object: 'rp_exp_destroy'
    }
}

const ExportDestroyList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchModal, setSearchModal] = useState({ ...searchDefaultModal })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const export_SendReqFlag = useRef(false)
    const dataSourceRef = useRef([])

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, searchModal.reason_tp, searchModal.invoice_no, searchModal.invoice_status, searchModal.product_id, 999999999999, 999999999999);
        const exportSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                switch (reqInfoMap.reqFunct) {
                    case reqFunction.REPORT_EXPORT_DESTROY:
                        resultGetList(msg, cltSeqResult, reqInfoMap)
                        break
                }
            }
        })
        return () => {
            exportSub.unsubscribe()
        }
    }, [])

    const getList = (startdate, endDate, reason_tp, invoice_no, invoice_status, product_id, last_invoice_id, last_invoice_detail_id) => {
        const inputParam = [startdate, endDate, reason_tp, invoice_no, invoice_status, product_id, last_invoice_id || 999999999999, last_invoice_detail_id || 999999999999]
        sendRequest(serviceInfo.GET_ALL, inputParam, null, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
    }

    const resultGetList = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        export_SendReqFlag.current = false
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            console.log('data: ', newData)
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[6] === 999999999999 && reqInfoMap.inputParam[7] === 999999999999) {
                    setTotalRecords(newData.rowTotal)
                } else {
                    setTotalRecords(dataSourceRef.current.length - newData.rows.length + newData.rowTotal)
                }
                dataSourceRef.current = dataSourceRef.current.concat(newData.rows)
                setDataSource(dataSourceRef.current)
            } else {
                dataSourceRef.current = [];
                setDataSource([])
                setTotalRecords(0)
            }
        }
    }

    const onClickColumn = e => {
        setAnChorEl(e.currentTarget);
    }

    const onCloseColumn = () => {
        setAnChorEl(null);
    }

    const onChangeColumnView = item => {
        const newColumn = [...column]
        const index = newColumn.findIndex(obj => obj.field === item.field)
        if (index >= 0) {
            newColumn[index]['show'] = !column[index]['show']
            setColumn(newColumn)
        }
    }

    const searchSubmit = searchObject => {
        dataSourceRef.current = []
        setSearchModal({ ...searchObject })
        setTotalRecords(0)
        getList(
            moment(searchObject.start_dt).format('YYYYMMDD'),
            moment(searchObject.end_dt).format('YYYYMMDD'),
            searchObject.reason_tp,
            searchObject.invoice_no.trim() !== '' ? searchObject.invoice_no.trim() : '%',
            searchObject.invoice_status,
            !!searchObject.product_id && searchObject.product_id !== 0 ? searchObject.product_id : 0,
            999999999999,
            999999999999
        )
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastInvoiceID = dataSourceRef.current[lastIndex].o_1
            const lastInvoiceDetailID = dataSourceRef.current[lastIndex].o_5
            getList(
                moment(searchModal.start_dt).format('YYYYMMDD'),
                moment(searchModal.end_dt).format('YYYYMMDD'),
                searchModal.reason_tp,
                searchModal.invoice_no.trim() !== '' ? searchModal.invoice_no.trim() : '%',
                searchModal.invoice_status,
                !!searchModal.product_id && searchModal.product_id !== 0 ? searchModal.product_id : 0,
                lastInvoiceID,
                lastInvoiceDetailID
            )
        }
    }

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                    action={
                        <IconButton style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>
                    }
                />
                <CardContent>
                    <ExportDestroySearch
                        handleSearch={searchSubmit}
                    />
                </CardContent>
            </Card>
            <ColumnCtrComp
                anchorEl={anChorEl}
                columns={tableColumn}
                handleClose={onCloseColumn}
                checkColumnChange={onChangeColumnView}
            />
            <Card>
                <CardHeader
                    title={t('order.exportDestroy.titleList')}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                        </div>
                    }
                />
                <CardContent>
                    <TableContainer className="tableContainer">
                        <Table stickyHeader>
                            <caption
                                className={['text-center text-danger border-bottom', dataSource.length > 0 ? 'd-none' : ''].join(
                                    ' '
                                )}
                            >
                                {t('lbl.emptyData')}
                            </caption>
                            <TableHead>
                                <TableRow>
                                    {column.map(col => (
                                        <TableCell nowrap="true"
                                            className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                            key={col.field}
                                        >
                                            {t(col.title)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataSource.map((item, index) => {
                                    return (
                                        <TableRow className='table-row-p8' hover role="checkbox" tabIndex={-1} key={index}>
                                            {column.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        default:
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {glb_sv.formatValue(value, col['type'])}
                                                                </TableCell>
                                                            )
                                                    }
                                                }
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </>
    )
}

export default ExportDestroyList