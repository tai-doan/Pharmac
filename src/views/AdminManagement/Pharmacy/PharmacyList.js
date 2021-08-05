import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton
} from '@material-ui/core'

import FastForwardIcon from '@material-ui/icons/FastForward';
import EditIcon from '@material-ui/icons/Edit'

import ColumnCtrComp from '../../../components/_ColumnCtr'
import ExportExcel from '../../../components/ExportExcel'
import DisplayColumn from '../../../components/DisplayColumn';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn } from './Modal/Pharmacy.modal'
import PharmacySearch from './PharmacySearch';
import PharmacyEdit from './PharmacyEdit';


const serviceInfo = {
    GET_ALL: {
        functionName: 'get_all',
        reqFunct: reqFunction.PHARMACY_LIST,
        biz: 'admin',
        object: 'pharmacy'
    }
}

const PharmacyList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState({
        status: '%'
    })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)

    const [id, setId] = useState(0)
    const [searchProcess, setSearchProcess] = useState(false)

    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const idRef = useRef(0)

    useEffect(() => {
        getList(searchValue.status, glb_sv.defaultValueSearch);
    }, [])

    const getList = (status, lastID) => {
        const inputParam = [status || '%', lastID || glb_sv.defaultValueSearch]
        setSearchProcess(true)
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setSearchProcess(false)
    }

    const handleResultGetList = (reqInfoMap, message) => {
        setSearchProcess(false)
        // SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[1] === glb_sv.defaultValueSearch) {
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

    const searchSubmit = obj => {
        // if (value === searchRef.current) return
        searchRef.current = obj
        dataSourceRef.current = []
        setSearchValue(obj)
        setTotalRecords(0)
        getList(obj.status, glb_sv.defaultValueSearch)
    }

    const onEdit = item => {
        setId(item ? item.o_1 : 0)
        setShouldOpenEditModal(true)
        idRef.current = item && item.o_1 > 0 ? item.o_1 : 0
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1;
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(searchValue.status, lastID)
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('pharmacy.pharmacyName'), key: 'pharmacyName' },
        { label: t('pharmacy.approve_status'), key: 'approve_status' },
        { label: t('pharmacy.address'), key: 'address' },
        { label: t('pharmacy.licence'), key: 'licence' },
        { label: t('pharmacy.licence_dt'), key: 'licence_dt' },
        { label: t('pharmacy.licence_pl'), key: 'licence_pl' },
        { label: t('pharmacy.boss_name'), key: 'boss_name' },
        { label: t('pharmacy.boss_phone'), key: 'boss_phone' },
        { label: t('pharmacy.boss_email'), key: 'boss_email' },
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['pharmacyName'] = data.o_2
            item['approve_status'] = data.o_4
            item['address'] = data.o_5
            item['licence'] = data.o_6
            item['licence_dt'] = glb_sv.formatValue(data.o_7, 'dated')
            item['licence_pl'] = data.o_8
            item['boss_name'] = data.o_9
            item['boss_phone'] = data.o_10
            item['boss_email'] = data.o_11
            return item
        })
        return result
    }

    const handleRefresh = () => {
        dataSourceRef.current = []
        setTotalRecords(0)
        getList(searchValue.status, glb_sv.defaultValueSearch);
    }

    return (
        <>
            <Card className='mb-2'>
                <CardHeader
                    title={t('lbl.search')}
                />
                <CardContent>
                    <PharmacySearch
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
                    title={<>{t('pharmacy.titleList')}
                        {/* <IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                            <MoreVertIcon />
                        </IconButton> */}
                        <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                    </>}
                    action={
                        <div className='d-flex align-items-center'>
                            <Chip size="small" variant='outlined' className='mr-1' label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')} />
                            <Chip size="small" className='mr-1' deleteIcon={<FastForwardIcon />} onDelete={() => null} color="primary" label={t('getMoreData')} onClick={getNextData} disabled={dataSourceRef.current.length >= totalRecords} />
                            <ExportExcel filename='user' data={dataCSV()} headers={headersCSV} style={{ backgroundColor: '#00A248', color: '#fff' }} />
                        </div>
                    }
                />
                <CardContent>
                    {/* table */}
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
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            {column.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        case 'action':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    <IconButton
                                                                        onClick={e => {
                                                                            onEdit(item)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
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

            {/* modal edit */}
            <PharmacyEdit
                id={id}
                shouldOpenModal={shouldOpenEditModal}
                setShouldOpenModal={setShouldOpenEditModal}
                onRefresh={handleRefresh}
            />
        </>
    )
}

export default PharmacyList