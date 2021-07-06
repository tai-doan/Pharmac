import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import NumberFormat from 'react-number-format'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import Supplier_Autocomplete from '../../Partner/Supplier/Control/Supplier.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import reqFunction from '../../../utils/constan/functions';
import { config } from './Modal/Import.modal'
import { requestInfo } from '../../../utils/models/requestInfo'

const serviceInfo = {
    GET_IMPORT_BY_ID: {
        functionName: config['byId'].functionName,
        reqFunct: config['byId'].reqFunct,
        biz: config.biz,
        object: config.object
    }
}

const ImportEdit = ({ id, shouldOpenEditModal, handleCloseEditModal, handleUpdate }) => {
    const { t } = useTranslation()

    const [Import, setImport] = useState({})
    const [supplierSelect, setSupplierSelect] = useState('')

    useEffect(() => {
        const ImportSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.IMPORT_BY_ID) {
                    resultGetImportByID(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            ImportSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (id) {
            sendRequest(serviceInfo.GET_IMPORT_BY_ID, [id], null, true, timeout => console.log('timeout: ', timeout))
        }
    }, [id])

    const resultGetImportByID = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey)
        reqInfoMap.procStat = 2
        if (message['PROC_STATUS'] === 2) {
            reqInfoMap.resSucc = false
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        }
        if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            setImport(newData.rows[0])
            setSupplierSelect(newData.rows[0].o_5)
        }
    }

    const checkValidate = () => {
        if (!!Import.o_1 && !!Import.o_2 && !!Import.o_4 && !!Import.o_6 && !!Import.o_7 && !!Import.o_8 && !!Import.o_9 && !!Import.o_10) {
            return false
        }
        return true
    }

    const handleSelectSupplier = obj => {
        const newImport = { ...Import };
        newImport['o_4'] = !!obj ? obj?.o_1 : null
        setSupplierSelect(!!obj ? obj?.o_2 : '')
        setImport(newImport)
    }

    const handleChange = e => {
        const newImport = { ...Import };
        newImport[e.target.name] = e.target.value
        setImport(newImport)
    }

    const handleDateChange = date => {
        const newImport = { ...Import };
        newImport['o_6'] = date;
        setImport(newImport)
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenEditModal}
            onClose={e => {
                handleCloseEditModal(false)
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('order.import.titleEdit', { name: Import.o_3 })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <Supplier_Autocomplete
                            value={supplierSelect}
                            style={{ marginTop: 8, marginBottom: 4 }}
                            size={'small'}
                            label={t('menu.supplier')}
                            onSelect={handleSelectSupplier}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                margin="dense"
                                variant="inline"
                                format="dd/MM/yyyy"
                                id="order_dt-picker-inline"
                                label={t('order.import.order_dt')}
                                value={Import.o_6 || new Date()}
                                onChange={handleDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.person_s')}
                            onChange={handleChange}
                            value={Import.o_8 || ''}
                            name='o_8'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={1}
                            autoComplete="off"
                            label={t('order.import.person_r')}
                            onChange={handleChange}
                            value={Import.o_9 || ''}
                            name='o_9'
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('order.import.note')}
                            onChange={handleChange}
                            value={Import.o_11 || ''}
                            name='o_11'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseEditModal(false);
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
                <Button
                    onClick={() => {
                        handleUpdate(Import);
                    }}
                    variant="contained"
                    disabled={checkValidate()}
                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                >
                    {t('btn.save')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ImportEdit