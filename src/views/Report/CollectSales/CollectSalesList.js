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

import { tableColumn, searchDefaultModal } from './Modal/CollectSales.modal'
import CollectSalesSearch from './CollectSalesSearch';
import { Card, CardHeader, CardContent, IconButton, Tooltip, Grid } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import moment from 'moment'
import { Link } from 'react-router-dom'
import ExportExcel from '../../../components/ExportExcel'

const serviceInfo = {
    GET_ALL: {
        functionName: 'set_exp_time',
        reqFunct: reqFunction.REPORT_COLLECT_SALES,
        biz: 'report',
        object: 'rp_settlement'
    }
}

const CollectSalesList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchModal, setSearchModal] = useState({ ...searchDefaultModal })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const export_SendReqFlag = useRef(false)
    const dataSourceRef = useRef([])

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, searchModal.customer_id, searchModal.invoice_no, glb_sv.defaultValueSearch, glb_sv.defaultValueSearch);
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
                    case reqFunction.REPORT_COLLECT_SALES:
                        resultGetList(msg, cltSeqResult, reqInfoMap)
                        break
                }
            }
        })
        return () => {
            exportSub.unsubscribe()
        }
    }, [])

    const getList = (startdate, endDate, customer_id, invoice_no, last_invoice_id, last_invoice_detail_id) => {
        const inputParam = [startdate, endDate, customer_id, invoice_no, last_invoice_id || glb_sv.defaultValueSearch, last_invoice_detail_id || glb_sv.defaultValueSearch]
        sendRequest(serviceInfo.GET_ALL, inputParam, null, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
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
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[4] === glb_sv.defaultValueSearch && reqInfoMap.inputParam[5] === glb_sv.defaultValueSearch) {
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
            !!searchObject.customer_id && searchObject.customer_id !== 0 ? searchObject.customer_id : 0,
            searchObject.invoice_no.trim() !== '' ? searchObject.invoice_no.trim() : '%',
            glb_sv.defaultValueSearch,
            glb_sv.defaultValueSearch
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
                !!searchModal.customer_id && searchModal.customer_id !== 0 ? searchModal.customer_id : 0,
                searchModal.invoice_no.trim() !== '' ? searchModal.invoice_no.trim() : '%',
                lastInvoiceID,
                lastInvoiceDetailID
            )
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('invoice_no'), key: 'invoice_no' },
        { label: t('partner.customer.cust_nm_v'), key: 'cust_nm_v' },
        { label: t('report.payment_amount'), key: 'payment_amount' },
        { label: t('report.invoice_val'), key: 'invoice_val' },
        { label: t('report.payment_method'), key: 'payment_method' },
        { label: t('report.payment_date'), key: 'payment_date' },
        { label: t('report.bank_transf_acc_number'), key: 'bank_transf_acc_number' },
        { label: t('report.bank_transf_acc_name'), key: 'bank_transf_acc_name' },
        { label: t('report.bank_transf_name'), key: 'bank_transf_name' },
        { label: t('report.bank_recei_acc_number'), key: 'bank_recei_acc_number' },
        { label: t('report.bank_recei_acc_name'), key: 'bank_recei_acc_name' },
        { label: t('report.bank_recei_name'), key: 'bank_recei_name' },
        { label: t('note'), key: 'note' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['invoice_no'] = data.o_3
            item['cust_nm_v'] = data.o_4
            item['invoice_val'] = data.o_5
            item['payment_amount'] =data.o_6
            item['payment_method'] = data.o_8
            item['payment_date'] = glb_sv.formatValue(data.o_9, 'dated')
            item['bank_transf_acc_number'] = data.o_10
            item['bank_transf_acc_name'] = data.o_11
            item['bank_transf_name'] = data.o_13
            item['bank_recei_acc_number'] = data.o_14
            item['bank_recei_acc_name'] = data.o_15
            item['bank_recei_name'] = data.o_17
            item['note'] = data.o_18
            item['createdUser'] = data.o_19
            item['createdDate'] = glb_sv.formatValue(data.o_20, 'date')
            // item['titleBranch'] = data.o_9
            return item
        })
        return result
    }

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                />
                <CardContent>
                    <CollectSalesSearch
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
                    title={<>{t('collecting_sales_list')}
                    <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='report-collecting-sales' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
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
                                        <TableCell nowrap="true" align={col.align}
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
                                                        case 'o_3':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    <Tooltip
                                                                        placement='top'
                                                                        aria-label="add"
                                                                        title={
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    {t('report.invoice_val')} : {col['o_5']}
                                                                                </Grid>
                                                                            </Grid>
                                                                        }
                                                                    >
                                                                        {glb_sv.formatValue(value, col['type'])}
                                                                    </Tooltip>
                                                                </TableCell>
                                                            )
                                                        case 'o_8':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {col['o_7'] === '2' ? <Tooltip
                                                                        placement='top'
                                                                        aria-label="add"
                                                                        title={
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    {t('bank_transf_acc_number')} : {col['o_10']}
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {t('bank_transf_acc_name')} : {col['o_11']}
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {t('bank_transf_name')} : {col['o_13']}
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {t('bank_recei_acc_number')} : {col['o_14']}
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {t('bank_recei_acc_name')} : {col['o_15']}
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {t('bank_recei_name')} : {col['o_17']}
                                                                                </Grid>
                                                                            </Grid>
                                                                        }
                                                                    >
                                                                        {glb_sv.formatValue(value, col['type'])}
                                                                    </Tooltip> :
                                                                        glb_sv.formatValue(value, col['type'])
                                                                    }
                                                                </TableCell>
                                                            )
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

export default CollectSalesList