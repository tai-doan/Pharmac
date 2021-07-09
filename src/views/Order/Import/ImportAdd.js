import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import Supplier_Autocomplete from '../../Partner/Supplier/Control/Supplier.Autocomplete'
import moment from 'moment'
import reqFunction from '../../../utils/constan/functions';
import glb_sv from '../../../utils/service/global_service'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import { requestInfo } from '../../../utils/models/requestInfo'
import sendRequest from '../../../utils/service/sendReq'

import AddProduct from './AddProduct'
import MaterialTableEditing from '../../../components/MaterialTableEditing/index';
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete';
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete';

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.IMPORT_CREATE,
        biz: 'import',
        object: 'imp_invoices'
    },
}

const ImportAdd = ({ handleCreate }) => {
    const { t } = useTranslation()

    const [Import, setImport] = useState({
        order_dt: moment().toString()
    })
    const [supplierSelect, setSupplierSelect] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const createContinue = useRef(false)

    useEffect(() => {
        const importSub = socket_sv.event_ClientReqRcv.subscribe(msg => {
            if (msg) {
                console.log('msg ra', msg)
                const cltSeqResult = msg['REQUEST_SEQ']
                if (cltSeqResult == null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
                    return
                }
                const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult)
                if (reqInfoMap == null || reqInfoMap === undefined) {
                    return
                }
                if (reqInfoMap.reqFunct === reqFunction.IMPORT_CREATE) {
                    resultCreate(msg, cltSeqResult, reqInfoMap)
                }
            }
        })
        return () => {
            importSub.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (shouldOpenModal) {
            setImport({ order_dt: moment().toString() })
            setSupplierSelect('')
        }
    }, [shouldOpenModal])

    const resultCreate = (message = {}, cltSeqResult = 0, reqInfoMap = new requestInfo()) => {
        if (message['PROC_CODE'] === 'SYS000') {
            //tạo thành công => tạo tiếp các sản phẩm thuộc hđ này
            if (createContinue.current) {
                setImport({ order_dt: moment().toString() })
                setSupplierSelect('')
                createContinue.current = false
            } else {
                setShouldOpenModal(false);
            }
        } else {
            setShouldOpenModal(false);
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t('message.noReceiveFeedback'), true, 4, 3000)
    }

    const handleCreateInvoice = () => {
        const inputParam = [
            !!Import.invoice_no ? Import.invoice_no : 'AUTO',
            Import.supplier,
            moment(Import.order_dt).format('YYYYMMDD'),
            Import.person_s,
            Import.person_r,
            Import.note
        ];
        sendRequest(serviceInfo.CREATE, inputParam, e => console.log(e), true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!Import.supplier && !!Import.order_dt) {
            return false
        }
        return true
    }

    const handleSelectSupplier = obj => {
        const newImport = { ...Import };
        newImport['supplier'] = !!obj ? obj?.o_1 : null
        setSupplierSelect(!!obj ? obj?.o_2 : '')
        setImport(newImport)
    }

    const handleDateChange = date => {
        const newImport = { ...Import };
        newImport['order_dt'] = date;
        setImport(newImport)
    }

    const handleChange = e => {
        const newImport = { ...Import };
        newImport[e.target.name] = e.target.value
        setImport(newImport)
    }

    const handleAddProduct = productObject => {
        console.log('productObject add: ', productObject)
    }

    const tableProductImportColumn = [
        {
            title: 'imp_tp',
            field: 'imp_tp',
            editComponent: props => (
                <Select
                    labelId="import_type"
                    id="import_type-select"
                    value={props.value || '1'}
                    onChange={e => console.log('props: ', props)}
                    label={t('order.import.import_type')}
                    name='imp_tp'
                >
                    <MenuItem value="1">{t('order.import.import_type_buy')}</MenuItem>
                    <MenuItem value="2">{t('order.import.import_type_selloff')}</MenuItem>
                </Select>
            )
        },
        {
            title: 'menu.product',
            field: 'prod_id',
            editComponent: props => (
                <Product_Autocomplete
                    value={props.value}
                    style={{ marginTop: 8, marginBottom: 4 }}
                    size={'small'}
                    label={t('menu.product')}
                    onSelect={e => console.log(e, props)}
                />
            )
        },
        {
            title: 'order.import.made_dt',
            field: 'made_dt',
            type: 'numeric',
            editable: 'never'
        },
        {
            title: 'order.import.exp_dt',
            field: 'exp_dt',
            type: 'numeric',
            editable: 'never'
        },
        {
            title: 'order.import.qty',
            field: 'qty',
            type: 'numeric'
        },
        {
            title: 'menu.configUnit',
            field: 'unit_id',
            editComponent: props => (
                <Unit_Autocomplete
                    value={props.value}
                    style={{ marginTop: 8, marginBottom: 4 }}
                    size={'small'}
                    label={t('menu.configUnit')}
                    onSelect={e => props.onChange(e.target.value)}
                />
            )
        },
        {
            title: 'order.import.price',
            field: 'price',
            type: 'numeric'
        },
        {
            title: 'order.import.discount_per',
            field: 'discount_per',
            type: 'numeric'
        },
        {
            title: 'order.import.vat_per',
            field: 'vat_per',
            type: 'numeric'
        }
    ]

    return (
        <>
            <Button size="small" style={{ backgroundColor: 'green', color: '#fff' }} onClick={() => setShouldOpenModal(true)} variant="contained">{t('btn.add')}</Button>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={shouldOpenModal}
                onClose={e => {
                    setShouldOpenModal(false)
                }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t('order.import.titleAdd')}
                </DialogTitle>
                <DialogContent className="pt-0">
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('order.import.invoice_no')}
                                onChange={handleChange}
                                value={Import.invoice_no || ''}
                                name='invoice_no'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Supplier_Autocomplete
                                value={supplierSelect}
                                style={{ marginTop: 8, marginBottom: 4 }}
                                size={'small'}
                                label={t('menu.supplier')}
                                onSelect={handleSelectSupplier}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    margin="dense"
                                    variant="outlined"
                                    style={{ width: '100%' }}
                                    inputVariant="outlined"
                                    format="dd/MM/yyyy"
                                    id="order_dt-picker-inline"
                                    label={t('order.import.order_dt')}
                                    value={Import.order_dt}
                                    onChange={handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('order.import.person_s')}
                                onChange={handleChange}
                                value={Import.person_s || ''}
                                name='person_s'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('order.import.person_r')}
                                onChange={handleChange}
                                value={Import.person_r || ''}
                                name='person_r'
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={9}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('order.import.note')}
                                onChange={handleChange}
                                value={Import.note || ''}
                                name='note'
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    {/* <MaterialTableEditing
                        title={t('order.import.productImportList')}
                        column={tableProductImportColumn}
                    /> */}
                </DialogContent>
                <DialogActions>
                    <AddProduct handleAddProduct={handleAddProduct} />
                    <Button
                        onClick={e => {
                            setShouldOpenModal(false);
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button
                        onClick={() => {
                            handleCreateInvoice(false, Import);
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    <Button
                        onClick={() => {
                            handleCreateInvoice(true, Import);
                            createContinue.current = true;
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('save_continue')}
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default ImportAdd