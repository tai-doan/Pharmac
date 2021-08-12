import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next'
import {
    Button, Dialog, CardHeader, CardContent, Card, CardActions, Chip, Table, TableBody, TableCell, TableRow, TableContainer, TableHead,
    Grid, TextField, Accordion, AccordionDetails, AccordionSummary, Typography, Tooltip
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Alert from '@material-ui/lab/Alert';

import sendRequest from '../../utils/service/sendReq';
import reqFunction from '../../utils/constan/functions';
import glb_sv from '../../utils/service/global_service'
import control_sv from '../../utils/service/control_services'
import ProductGroup_Autocomplete from '../../views/Products/ProductGroup/Control/ProductGroup.Autocomplete';
import UnitAdd_Autocomplete from '../../views/Config/Unit/Control/UnitAdd.Autocomplete';

import { ReactComponent as IC_DOCUMENT_FOLDER } from '../../asset/images/document-folder.svg'
import { ReactComponent as IC_DOCUMENT_DOWNLOAD_EXAMPLE } from '../../asset/images/document-download-example.svg'

const serviceInfo = {
    CREATE_UNIT: {
        functionName: 'insert',
        reqFunct: reqFunction.INS_UNIT,
        biz: 'common',
        object: 'units'
    },
    UNIT_DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.UNIT_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
    CREATE_GROUP: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_GROUP_ADD,
        biz: 'common',
        object: 'groups'
    },
    GROUP_DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.PRODUCT_GROUP_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list'
    },
    CREATE_PRODUCT: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_ADD,
        biz: 'common',
        object: 'products'
    }
}

const columns = [
    { key: 'code', title: 'products.product.code' },
    { key: 'name', title: 'products.product.name' },
    { key: 'group', title: 'menu.productGroup' },
    { key: 'unit', title: 'menu.configUnit' },
    { key: 'barcode', title: 'products.product.barcode' },
    { key: 'packing', title: 'products.product.packing' },
    { key: 'contents', title: 'products.product.content' },
    { key: 'designate', title: 'products.product.designate' },
    { key: 'contraind', title: 'products.product.contraind' },
    { key: 'dosage', title: 'products.product.dosage' },
    { key: 'manufact', title: 'products.product.manufact' },
    { key: 'interact', title: 'products.product.interact' },
    { key: 'storages', title: 'products.product.storages' },
    { key: 'effect', title: 'products.product.effect' },
    { key: 'overdose', title: 'products.product.overdose' }
];

const productDefaulModal = {
    code: '',
    name: '',
    group: '',
    groupID: null,
    unit: '',
    unitID: null,
    barcode: '',
    packing: '',
    content: '',
    designate: '',
    contraind: '',
    dosage: '',
    manufact: '',
    interact: '',
    storages: '',
    effect: '',
    overdose: ''
}

const ImportExcel = ({ title, onRefresh }) => {
    const { t } = useTranslation()

    const [shouldOpenModal, setShouldOpenModal] = useState(false);
    const [dataSource, setDataSource] = useState([])
    const [isError, setIsError] = useState(false)

    const [unitNotAvailable, setUnitNotAvailable] = useState([])
    const [groupNotAvailable, setGroupNotAvailable] = useState([])

    const [unitList, setUnitList] = useState([])
    const [groupList, setGroupList] = useState([])
    const [isExpanded, setIsExpanded] = useState(false)
    const [shouldOpenModalEdit, setShouldOpenModalEdit] = useState(false)
    const [editID, setEditID] = useState(null)
    const [editModal, setEditModal] = useState(productDefaulModal)
    const [fileSelected, setFileSelected] = useState('')

    const unitListRef = useRef([])
    const groupListRef = useRef([])

    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)
    const step9Ref = useRef(null)
    const step10Ref = useRef(null)
    const step11Ref = useRef(null)
    const step12Ref = useRef(null)
    const step13Ref = useRef(null)
    const step14Ref = useRef(null)
    const step15Ref = useRef(null)
    const allowFileTypes = useRef([
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ])

    useEffect(() => {
        sendRequest(serviceInfo.UNIT_DROPDOWN_LIST, ['units', '%'], resultUnitDropDownList, false)
        sendRequest(serviceInfo.GROUP_DROPDOWN_LIST, ['groups', '%'], resultGroupDropDownList, false)
    }, [])

    useEffect(() => {
        // Gửi event tạo các đơn vị trong file excel tải lên chưa có trên hệ thống
        if (unitNotAvailable.length > 0) {
            let i = 0;
            for (; i < unitNotAvailable.length; i++) {
                sendRequest(serviceInfo.CREATE_UNIT, [unitNotAvailable[i], ''], null, false)
            }
            if (i === unitNotAvailable.length) {
                // Sau khi gửi hết các thông tin => lấy lại danh sách đơn vị mới
                sendRequest(serviceInfo.GROUP_DROPDOWN_LIST, ['units', '%'], resultUnitDropDownList, false)
            }
        }
    }, [unitNotAvailable])

    useEffect(() => {
        // Gửi event tạo các nhóm sp trong file excel tải lên chưa có trên hệ thống
        if (groupNotAvailable.length > 0) {
            let i = 0;
            for (; i < groupNotAvailable.length; i++) {
                sendRequest(serviceInfo.CREATE_GROUP, [groupNotAvailable[i], ''], null, false)
            }
            if (i === groupNotAvailable.length) {
                // Sau khi gửi hết các thông tin => lấy lại danh sách nhóm sp mới
                sendRequest(serviceInfo.GROUP_DROPDOWN_LIST, ['groups', '%'], resultGroupDropDownList, false)
            }
        }
    }, [groupNotAvailable])

    const resultUnitDropDownList = (reqInfoMap, message = {}) => {
        setUnitNotAvailable([])
        if (message['PROC_STATUS'] !== 1) {
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            unitListRef.current = newData.rows
            setUnitList(newData.rows)
        }
    }

    const resultGroupDropDownList = (reqInfoMap, message = {}) => {
        setGroupNotAvailable([])
        if (message['PROC_STATUS'] !== 1) {
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            groupListRef.current = newData.rows
            setGroupList(newData.rows)
        }
    }

    const handleShowModal = () => {
        setDataSource([]);
        setShouldOpenModal(true)
    }

    const handleCloseModal = () => {
        setDataSource([]);
        setShouldOpenModal(false)
        setEditModal({ ...productDefaulModal })
        setEditID(null)
    }

    const handleOk = e => {
        e.preventDefault();
        if (!!isError) {
            return;
        }

        let i = 0
        for (; i < dataSource.length; i++) {
            const e = dataSource[i]
            const groupObject = groupListRef.current.find(x => x.o_2 === e.group)
            const unitObject = unitListRef.current.find(x => x.o_2 === e.unit)
            if (!e.name.trim()) {
                // Tên sp không có => bỏ qua không gửi lên sv
                continue
            } else if (!!e.groupID && !!e.unitID) {
                // Đủ thông tin tên sp, nhóm, đơn vị => gửi lên sv
                const inputParam = [
                    e.groupID,
                    !e.code || e.code.trim() === '' ? 'AUTO' : e.code.trim(),
                    e.name,
                    e.barcode,
                    e.unitID,
                    e.contents || '',
                    e.contraind || '',
                    e.designate || '',
                    e.dosage || '',
                    e.interact || '',
                    e.manufact || '',
                    e.effect || '',
                    e.overdose || '',
                    e.storages || '',
                    e.packing || ''
                ];
                sendRequest(serviceInfo.CREATE_PRODUCT, inputParam, handleResultCreate, false)
                continue
            } else if (e.groupID === null && e.unitID === null) {
                // Thiếu thông tin cả nhóm và đơn vị tính
                if (!!groupObject && !!groupObject.o_1 && !!unitObject && !!unitObject.o_1) {
                    // Hệ thống đã có các thông tin đơn vị tính và nhóm cần thiết => gửi lên
                    const inputParam = [
                        groupObject.o_1,
                        !e.code || e.code.trim() === '' ? 'AUTO' : e.code.trim(),
                        e.name,
                        e.barcode,
                        unitObject.o_1,
                        e.contents || '',
                        e.contraind || '',
                        e.designate || '',
                        e.dosage || '',
                        e.interact || '',
                        e.manufact || '',
                        e.effect || '',
                        e.overdose || '',
                        e.storages || '',
                        e.packing || ''
                    ];
                    sendRequest(serviceInfo.CREATE_PRODUCT, inputParam, handleResultCreate, false)
                    continue
                } else {
                    // Hệ thống chưa có nhóm/ đơn vị tính này => bỏ qua
                    continue
                }
            } else {
                // Thiếu thông tin đơn vị tính / nhóm sp
                if (e.unitID === null) {
                    // Thiếu thông tin đơn vị tính
                    if (!!unitObject && !!unitObject.o_1) {
                        // Hệ thống đã có thông tin đơn vị tính => gửi lên
                        const inputParam = [
                            e.groupID,
                            !e.code || e.code.trim() === '' ? 'AUTO' : e.code.trim(),
                            e.name,
                            e.barcode,
                            unitObject.o_1,
                            e.contents || '',
                            e.contraind || '',
                            e.designate || '',
                            e.dosage || '',
                            e.interact || '',
                            e.manufact || '',
                            e.effect || '',
                            e.overdose || '',
                            e.storages || '',
                            e.packing || ''
                        ];
                        sendRequest(serviceInfo.CREATE_PRODUCT, inputParam, handleResultCreate, false)
                        continue
                    } else {
                        // Hệ thống chưa có đơn vị tính
                        continue
                    }
                } else if (e.groupID === null) {
                    // Thiếu thông tin nhóm sản phẩm
                    if (!!groupObject && !!groupObject.o_1) {
                        // Hệ thống đã có thông tin nhóm sản phẩm => gửi lên
                        const inputParam = [
                            groupObject.o_1,
                            !e.code || e.code.trim() === '' ? 'AUTO' : e.code.trim(),
                            e.name,
                            e.barcode,
                            e.unitID,
                            e.contents || '',
                            e.contraind || '',
                            e.designate || '',
                            e.dosage || '',
                            e.interact || '',
                            e.manufact || '',
                            e.effect || '',
                            e.overdose || '',
                            e.storages || '',
                            e.packing || ''
                        ];
                        sendRequest(serviceInfo.CREATE_PRODUCT, inputParam, handleResultCreate, false)
                        continue
                    } else {
                        // Hệ thống chưa có thông tin nhóm sản phẩm => bỏ qua
                        continue
                    }
                }
            }
        }
        if (i === dataSource.length) {
            onRefresh()
            setGroupNotAvailable([])
            setUnitNotAvailable([])
            setEditID(null)
            setEditModal({ ...productDefaulModal })
            setShouldOpenModalEdit(false)
            setFileSelected('')
            setDataSource([])
            setShouldOpenModal(false)
        }
    };

    const handleResultCreate = (reqInfoMap, message) => {
    }

    const validateFile = value => {
        const flag = allowFileTypes.current.indexOf(value.type);
        if (flag === -1) {
            return false;
        }
        return true;
    };

    const getDataBeginRow = (file, beginRow) => {
        let data = [];
        const fileReader = new FileReader();
        fileReader.readAsBinaryString(file)

        fileReader.onload = event => {
            try {
                const { result } = event.target;
                const workbook = XLSX.read(result, { type: 'binary' });
                const sheetNameList = workbook.SheetNames;
                sheetNameList.forEach(function (y) {
                    const workSheet = workbook.Sheets[y];
                    const headers = {};
                    for (const w in workSheet) {
                        if (w[0] === '!') continue;
                        //parse out the column, row, and value
                        const row = parseInt(w.substring(1));
                        if (row == beginRow - 1) {
                            continue;
                        }
                        const col = w.substring(0, 1);
                        const value = workSheet[w].v;
                        //store header names
                        if (row === beginRow) {
                            headers[col] = value;
                            continue;
                        }
                        if (!data[row - 1]) {
                            data[row - 1] = {
                                groupID: null,
                                unitID: null
                            };
                        }
                        data[row - 1][headers[col]] = value;
                        // Thêm unitID và groupID cho data
                        const unitObject = unitList.find(x => x.o_2 === data[row - 1]?.unit)
                        const groupObject = groupList.find(x => x.o_2 === data[row - 1]?.group)
                        data[row - 1]['unitID'] = !!unitObject?.o_1 ? unitObject?.o_1 : null
                        data[row - 1]['groupID'] = !!groupObject?.o_1 ? groupObject?.o_1 : null
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();

                    // Check những đơn vị tính và nhóm sp chưa có
                    const unitSysNameList = unitList.map(x => x.o_2)
                    const groupSysNameList = groupList.map(x => x.o_2)
                    const unitDataNameList = data.map(x => x.unit)
                    const groupDataNameList = data.map(x => x.group)
                    // Lưu các đơn vị/nhóm sp chưa có trên system => gửi event tạo các đơn vị/nhóm sp mới
                    setUnitNotAvailable([...new Set(unitDataNameList.filter(item => !unitSysNameList.includes(item)))])
                    setGroupNotAvailable([...new Set(groupDataNameList.filter(item => !groupSysNameList.includes(item)))])
                    setDataSource([...data])
                });
            } catch (e) {
            }
        }
    };

    const getData = file => {
        const fileReader = new FileReader();
        fileReader.onload = event => {
            try {
                const data = [];
                const { result } = event.target;
                const workbook = XLSX.read(result, { type: 'binary' });
                for (const Sheet in workbook.Sheets) {
                    if (workbook.Sheets.hasOwnProperty(Sheet)) {
                        const rs = XLSX.utils.sheet_to_json(workbook.Sheets[Sheet]);
                        data.push(rs);
                    }
                }
                setDataSource(data[0])
            } catch (e) {
            }
        };
        fileReader.readAsBinaryString(file);
    };

    const handleImportChange = e => {
        setDataSource([])
        setFileSelected('')
        const { files } = e.target;
        if (files.length === 1) {
            // Process a file if we have exactly one
            if (validateFile(files[0]) === true) {
                getDataBeginRow(files[0], 2);
                setFileSelected(files[0].name)
                setIsError(false);
            } else {
                setFileSelected('')
                setIsError(true);
            }
        }
    };

    const handleEditRow = (data, index) => {
        setEditID(index)
        setEditModal(data)
        setShouldOpenModalEdit(true)
    }

    const handleChange = e => {
        const newModal = { ...editModal };
        newModal[e.target.name] = e.target.value;
        setEditModal(newModal)
    }

    const handleChangeExpand = () => {
        setIsExpanded(e => !e)
    }

    const handleSelectProductGroup = obj => {
        const newModal = { ...editModal };
        newModal['groupID'] = !!obj ? obj?.o_1 : null
        newModal['group'] = !!obj ? obj?.o_2 : ''
        setEditModal(newModal)
    }

    const handleSelectUnit = obj => {
        const newModal = { ...editModal };
        newModal['unitID'] = !!obj ? obj?.o_1 : null
        newModal['unit'] = !!obj ? obj?.o_2 : ''
        setEditModal(newModal)
    }

    const handleUpdateRow = () => {
        let newDataSource = [...dataSource]
        newDataSource.splice(editID, 1, editModal);
        setDataSource(newDataSource)
        setEditID(null)
        setEditModal({ ...productDefaulModal })
        setShouldOpenModalEdit(false)
    }

    return (
        <>
            <Chip size='small' variant='outlined bg-print' style={{ color: '#fff', backgroundColor: 'green' }} className='ml-1' onClick={handleShowModal} label={t('import_excel')} />
            <Dialog
                maxWidth='md'
                open={shouldOpenModal}
            >
                <Card className='product-card'>
                    <CardHeader title={title ? title : t('import_excel')} />
                    <CardContent>
                        <input style={{ display: 'none' }} id='container-upload-file' type='file' accept='.xlsx, .xls, .csv' onChange={handleImportChange} />
                        <label htmlFor='container-upload-file'>
                            <div title={t('choose_file')} style={{ borderRadius: 5, backgroundColor: 'rgb(225 227 228 / 57%)', padding: '2px 10px' }}>
                                <IC_DOCUMENT_FOLDER /> {fileSelected !== '' ? `(${fileSelected})` : t('choose_file')}
                            </div>
                        </label>
                        {isError &&
                            <Alert severity='error'>{t('message.error_file')}</Alert>
                        }
                        {dataSource.length > 0 &&
                            <TableContainer className='tableContainer mt-2'>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {columns?.map(col => (
                                                <TableCell
                                                    nowrap='true'
                                                    className={['p-2 border-0', 'd-table-cell'].join(' ')}
                                                    key={col.key}
                                                >
                                                    {t(col.title)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataSource?.length > 0 && dataSource?.map((item, index) => {
                                            return (
                                                <TableRow onDoubleClick={() => handleEditRow(item, index)} className={item.groupID === null || item.unitID === null ? 'warning table-row-p8' : 'table-row-p8'} hover role='checkbox' tabIndex={-1} key={index}>
                                                    {columns?.map((col, indexRow) => {
                                                        let value = item[col.key]
                                                        return (
                                                            <TableCell nowrap='true' key={indexRow} align={col.align}>
                                                                {glb_sv.formatValue(value)}
                                                            </TableCell>
                                                        )
                                                    })}
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            className='bg-print text-white'
                            onClick={() => window.open(window.location.origin + '/asset/files/product_'+glb_sv.langCrt+'.xlsx', '_blank')}
                            variant='contained'
                            disableElevation
                        >
                            <IC_DOCUMENT_DOWNLOAD_EXAMPLE /> {t('example_file')}
                        </Button>
                        <Button size='small'
                            onClick={handleCloseModal}
                            variant='contained'
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={handleOk}
                            variant='contained'
                            className='bg-success text-white'
                        >
                            {t('btn.save')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>

            {/* Modal cập nhật dòng dữ liệu */}
            <Dialog
                fullWidth={true}
                maxWidth='md'
                open={shouldOpenModalEdit}
            >
                <Card className='product-card'>
                    <CardHeader title={t('products.product.titleEdit')} />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={3}>
                                <Tooltip placement='top' title={t('product.tooltip.productCode')} arrow>
                                    <TextField
                                        fullWidth={true}
                                        autoComplete='off'
                                        margin='dense'
                                        label={t('products.product.code')}
                                        value={editModal.code}
                                        name='code'
                                        handleChange={handleChange}
                                        variant='outlined'
                                        className='uppercaseInput'
                                        inputRef={step1Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step2Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Tooltip>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    required={true}
                                    autoComplete='off'
                                    margin='dense'
                                    label={t('products.product.name')}
                                    onChange={handleChange}
                                    value={editModal.name}
                                    name='name'
                                    variant='outlined'
                                    className='uppercaseInput'
                                    inputRef={step2Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step3Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <ProductGroup_Autocomplete
                                    productGroupID={editModal.groupID || null}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.productGroup')}
                                    onSelect={handleSelectProductGroup}
                                    inputRef={step3Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step4Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={3} className='d-flex align-items-center'>
                                <UnitAdd_Autocomplete
                                    unitID={editModal.unitID}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                    inputRef={step4Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step5Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <Tooltip placement='top' title={t('product.tooltip.barcode')} arrow>
                                    <TextField
                                        fullWidth={true}
                                        autoComplete='off'
                                        margin='dense'
                                        label={t('products.product.barcode')}
                                        onChange={handleChange}
                                        value={editModal.barcode}
                                        name='barcode'
                                        variant='outlined'
                                        inputRef={step5Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step6Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Tooltip>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <TextField
                                    fullWidth={true}
                                    margin='dense'
                                    autoComplete='off'
                                    label={t('products.product.packing')}
                                    onChange={handleChange}
                                    value={editModal.packing}
                                    name='packing'
                                    variant='outlined'
                                    inputRef={step6Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            step7Ref.current.focus()
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <TextField
                                    fullWidth={true}
                                    margin='dense'
                                    autoComplete='off'
                                    label={t('products.product.content')}
                                    onChange={handleChange}
                                    value={editModal.contents}
                                    name='contents'
                                    variant='outlined'
                                    inputRef={step7Ref}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            setIsExpanded(true)
                                            setTimeout(() => {
                                                step8Ref.current.focus()
                                            }, 10);
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Accordion className='mt-2' expanded={isExpanded} onChange={handleChangeExpand}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1bh-content'
                                id='panel1bh-header'
                                height='50px'
                            >
                                <Typography className=''>{t('product.infoExpand')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails className='pt-0'>
                                <Grid container className='' spacing={1}>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.designate')}
                                            onChange={handleChange}
                                            value={editModal.designate}
                                            name='designate'
                                            variant='outlined'
                                            inputRef={step8Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step9Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.contraind')}
                                            onChange={handleChange}
                                            value={editModal.contraind}
                                            name='contraind'
                                            variant='outlined'
                                            inputRef={step9Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step10Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.dosage')}
                                            onChange={handleChange}
                                            value={editModal.dosage}
                                            name='dosage'
                                            variant='outlined'
                                            inputRef={step10Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step11Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.manufact')}
                                            onChange={handleChange}
                                            value={editModal.manufact}
                                            name='manufact'
                                            variant='outlined'
                                            inputRef={step11Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step12Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.interact')}
                                            onChange={handleChange}
                                            value={editModal.interact}
                                            name='interact'
                                            variant='outlined'
                                            inputRef={step12Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step13Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.storages')}
                                            onChange={handleChange}
                                            value={editModal.storages}
                                            name='storages'
                                            variant='outlined'
                                            inputRef={step13Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step14Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.effect')}
                                            onChange={handleChange}
                                            value={editModal.effect}
                                            name='effect'
                                            variant='outlined'
                                            inputRef={step14Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step15Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            fullWidth={true}
                                            margin='dense'
                                            autoComplete='off'
                                            label={t('products.product.overdose')}
                                            onChange={handleChange}
                                            value={editModal.overdose}
                                            name='overdose'
                                            variant='outlined'
                                            inputRef={step15Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    handleUpdateRow()
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={(e) => {
                                setShouldOpenModalEdit(false)
                                setEditID(null)
                                setEditModal({ ...productDefaulModal })
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={() => handleUpdateRow()}
                            variant="contained"
                            disabled={(!editModal.name.trim() || !editModal.groupID || !editModal.unitID) ? true : false}
                            className={(!editModal.name.trim() || !editModal.groupID || !editModal.unitID) ? '' : 'bg-success text-white'}
                        >
                            {t('btn.update')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default ImportExcel;
