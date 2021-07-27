import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import FastForwardIcon from '@material-ui/icons/FastForward';
import Chip from '@material-ui/core/Chip';
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, searchDefaultModal } from './Modal/Import.modal'
import ImportSearch from './ImportSearch';
import { Card, CardHeader, CardContent, IconButton } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import moment from 'moment'
import ExportExcel from '../../../components/ExportExcel'

const serviceInfo = {
    GET_ALL: {
        functionName: 'imp_time',
        reqFunct: reqFunction.REPORT_IMPORT_TIME,
        biz: 'report',
        object: 'rp_import'
    }
}

const ImportList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchModal, setSearchModal] = useState({ ...searchDefaultModal })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])
    const [searchProcess, setSearchProcess] = useState(false)

    const dataSourceRef = useRef([])

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, searchModal.supplier_id, searchModal.invoice_no, searchModal.invoice_status, searchModal.product_id, glb_sv.defaultValueSearch, glb_sv.defaultValueSearch);
    }, [])

    const getList = (startdate, endDate, supplier_id, invoice_no, invoice_status, product_id, last_invoice_id, last_invoice_detail_id) => {
        setSearchProcess(true)
        const inputParam = [startdate, endDate, supplier_id, invoice_no, invoice_status, product_id, last_invoice_id || glb_sv.defaultValueSearch, last_invoice_detail_id || glb_sv.defaultValueSearch]
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetAll, true, handleTimeOut)
    }

    const handleResultGetAll = (reqInfoMap, message) => {
        setSearchProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[6] === glb_sv.defaultValueSearch && reqInfoMap.inputParam[7] === glb_sv.defaultValueSearch) {
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

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setSearchProcess(false)
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
            !!searchObject.supplier_id && searchObject.supplier_id !== 0 ? searchObject.supplier_id : 0,
            searchObject.invoice_no.trim() !== '' ? searchObject.invoice_no.trim() : '%',
            searchObject.invoice_status,
            !!searchObject.product_id && searchObject.product_id !== 0 ? searchObject.product_id : 0,
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
                !!searchModal.supplier_id && searchModal.supplier_id !== 0 ? searchModal.supplier_id : 0,
                searchModal.invoice_no.trim() !== '' ? searchModal.invoice_no.trim() : '%',
                searchModal.invoice_status,
                !!searchModal.product_id && searchModal.product_id !== 0 ? searchModal.product_id : 0,
                lastInvoiceID,
                lastInvoiceDetailID
            )
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('invoice_no'), key: 'invoice_no' },
        { label: t('partner.supplier.vender_nm_v'), key: 'vender_nm' },
        { label: t('order.import.order_dt'), key: 'order_dt' },
        { label: t('products.product.name'), key: 'product_name' },
        { label: t('order.import.lot_no'), key: 'lot_no' },
        { label: t('order.import.exp_dt'), key: 'exp_dt' },
        { label: t('order.import.qty'), key: 'qty' },
        { label: t('order.import.unit_nm'), key: 'unit_nm' },
        { label: t('order.import.price'), key: 'price' },
        { label: t('report.discount_per'), key: 'discount_per' },
        { label: t('report.vat_per'), key: 'vat_per' },
        { label: t('order.import.vals'), key: 'vals' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['invoice_no'] = data.o_2
            item['vender_nm'] = data.o_3
            item['order_dt'] = glb_sv.formatValue(data.o_4, 'dated')
            item['product_name'] = data.o_7
            item['lot_no'] = data.o_8
            item['exp_dt'] = glb_sv.formatValue(data.o_9, 'dated')
            item['qty'] = data.o_10
            item['unit_nm'] = data.o_12
            item['price'] = data.o_13
            item['discount_per'] = data.o_14
            item['vat_per'] = data.o_15
            item['vals'] = data.o_16
            item['createdUser'] = data.o_17
            item['createdDate'] = glb_sv.formatValue(data.o_18, 'date')
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
                    <ImportSearch
                        process={searchProcess}
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
                    title={<>{t('order.import.titleList')}
                        <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton>
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='report-import' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                        </div>
                    }
                />
                <CardContent>
                    <TableContainer className="tableContainer tableReport">
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

export default ImportList