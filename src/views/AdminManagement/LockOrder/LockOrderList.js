import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, FormControlLabel, Checkbox
} from '@material-ui/core'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn } from './Modal/LockOrder.Modal'

import { ReactComponent as IC_REFRESH } from '../../../asset/images/refresh.svg'

const serviceInfo = {
    GET_ALL: {
        functionName: 'get_lock_ord',
        reqFunct: reqFunction.LOCK_ORDER_LIST,
        biz: 'admin',
        object: 'lock_order'
    },
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.LOCK_ORDER_UPDATE,
        biz: 'admin',
        object: 'lock_order'
    }
}

const LockOrderList = () => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [column, setColumn] = useState(tableColumn)

    useEffect(() => {
        const inputParam = [glb_sv.branchId || 0]
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
    }, [])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleResultGetList = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            const newData = message['PROC_DATA']
            setDataSource(newData.rows)
        }
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            handleRefresh()
        }
    }

    const handleRefresh = () => {
        setDataSource([])
        const inputParam = [glb_sv.branchId || 0]
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
    }

    const handleChange = (item, checked) => {
        const inputParam = [glb_sv.branchId, item.o_1, checked ? 'Y' : 'N']
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    return (
        <>
            <Card>
                <CardHeader
                    title={<>
                        {t('lockOrder.titleList')}
                        <IconButton className='ml-2' style={{ padding: 2, backgroundColor: '#fff' }} onClick={handleRefresh}>
                            <IC_REFRESH />
                        </IconButton>
                    </>} />
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
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Checkbox
                                                                                checked={item['o_3'] === 'Y' ? true : false}
                                                                                onChange={(event, checked) => handleChange(item, checked)}
                                                                            />
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            )
                                                        case 'o_5':
                                                            return (
                                                                <TableCell nowrap="true" key={indexRow} align={col.align}>
                                                                    {value === '0' ? t('no') : t('yes')}
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

export default LockOrderList