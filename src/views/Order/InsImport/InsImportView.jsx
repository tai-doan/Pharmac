import React from "react";
import { Link } from 'react-router-dom';
import T from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import LoadingView from '../../../components/Loading/View';
import NumberInput from '../../../components/InputCustom/NumberInput'
import TextInput from '../../../components/InputCustom/TextInput'
import AddIcon from '@material-ui/icons/Add'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Fab from '@material-ui/core/Fab'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import glb_sv from '../../../utils/service/global_service'


const InsImportView = ({
    loading,
    tableCol,
    data,
    // dataType,
    // dataUnitTime,
    // dataUnit,
    id,


    openDialogRemove,
    changeDialogRemove,

    invoice_no,
    changeInvoice_no,

    vender_id,
    changeVender_id,

    person_s,
    changePerson_s,

    person_r,
    changePerson_r,

    invoice_auto,
    changeInvoice_auto,

    imp_tp,
    changeImp_tp,

    prod_id,
    changeProd_id,

    lot_no,
    changeLot_no,

    made_dt,
    changeMade_dt,

    exp_dt,
    changeExp_dt,

    qty,
    changeQty,

    unit_id,
    changeUnit_id,

    price,
    changePrice,

    checkValidate,
    submitMaster,
    submitDetail
}) => {

    const { t } = useTranslation();

    if (loading) {
        return (<LoadingView className={id < 0 ? 'd-no' : ''} />)
    } else {
        return (
            <>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="font-weight-bold m-0">{t('order.ins_import.titleAdd')}</h6>
                </div>

                <Grid container spacing={1}>
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('order.ins_import.invoice_no')}
                        onChange={changeInvoice_no}
                        value={invoice_no || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('order.ins_import.vender_id')}
                        onChange={changeVender_id}
                        value={vender_id || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('order.ins_import.person_s')}
                        onChange={changePerson_s}
                        value={person_s || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('order.ins_import.person_r')}
                        onChange={changePerson_r}
                        value={person_r || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('order.ins_import.invoice_auto')}
                        onChange={changeInvoice_auto}
                        value={invoice_auto || ''}
                        variant="outlined"
                    />
                </Grid>
                <div className="text-right mb-3">
                    <Link to="/page/order/import" className="mr-3 normalLink">
                        <Button variant="contained" disableElevation>
                            {t('btn.back')}
                        </Button>
                    </Link>
                    <Button onClick={submitMaster} variant="contained" startIcon={<SaveIcon />} disabled={checkValidate()} className={checkValidate() === false ? 'bg-success text-white' : ''}>
                        {t('btn.save')}
                    </Button>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="font-weight-bold m-0">{t('order.ins_import.titleAdd')}</h6>
                </div>

                <Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                        <TableContainer>
                            <Table stickyHeader>
                                <caption
                                    className={[
                                        'text-center text-danger border-bottom',
                                        data.length > 0 ? 'd-none' : '',
                                    ].join(' ')}
                                >
                                    {t('lbl.emptyData')}
                                </caption>
                                <TableHead>
                                    <TableRow>
                                        {tableCol.map(col => (
                                            <TableCell
                                                className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                                key={col.field}
                                            >
                                                {t(col.title)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data
                                        .map((item, index) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                    {tableCol.map((col, indexRow) => {
                                                        let value = item[col.field]
                                                        if (col.show) {
                                                            switch (col.field) {
                                                                case 'action':
                                                                    return (
                                                                        <TableCell
                                                                            nowrap="true"
                                                                            key={indexRow}
                                                                            align={col.align}
                                                                        >
                                                                            <IconButton
                                                                                onClick={e => {
                                                                                    changeDialogRemove(item)
                                                                                }}
                                                                            >
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton>
                                                                                <IconButton
                                                                                    key={indexRow}
                                                                                    onClick={submitDetail}
                                                                                >
                                                                                    <EditIcon fontSize="small" />
                                                                                </IconButton>
                                                                        </TableCell>
                                                                    )
                                                                default:
                                                                    return (
                                                                        <TableCell key={indexRow} align={col.align}>
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
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Grid container spacing={1}>
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.imp_tp')}
                                onChange={changeImp_tp}
                                value={imp_tp || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.prod_id')}
                                onChange={changeProd_id}
                                value={prod_id || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.lot_no')}
                                onChange={changeLot_no}
                                value={lot_no || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.made_dt')}
                                onChange={changeMade_dt}
                                value={made_dt || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.exp_dt')}
                                onChange={changeExp_dt}
                                value={exp_dt || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.qty')}
                                onChange={changeQty}
                                value={qty || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.unit_id')}
                                onChange={changeUnit_id}
                                value={unit_id || ''}
                                variant="outlined"
                            />
                            <TextInput
                                fullWidth={true}
                                margin="dense"
                                autoComplete="off"
                                label={t('order.ins_import.price')}
                                onChange={changePrice}
                                value={price || ''}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <div className="text-right mt-3">
                    <Link to="/page/order/import" className="mr-3 normalLink">
                        <Button variant="contained" disableElevation>
                            {t('btn.back')}
                        </Button>
                    </Link>
                    <Button onClick={submitDetail} variant="contained" startIcon={<SaveIcon />} disabled={checkValidate()} className={checkValidate() === false ? 'bg-success text-white' : ''}>
                        {t('btn.save')}
                    </Button>
                </div>
            </>
        )
    }
}

InsImportView.propTypes = {
    loading: T.bool,

    // dataType: T.array,
    // dataUnitTime: T.array,
    // dataUnit: T.array,
    // id: T.any,

    // productTypeId: T.string,
    // changeProductTypeId: T.func,

    // name: T.string,
    // changeName: T.func,

    // barcode: T.string,
    // changeBarcode: T.func,

    // price: T.number,
    // changePrice: T.func,

    // wholePrice: T.number,
    // changeWholePrice: T.func,

    // originalPrice: T.number,
    // changeOriginalPrice: T.func,

    // unitId: T.string,
    // changeUnitId: T.func,

    // minQty: T.number,
    // changeMinQty: T.func,

    // maxQty: T.number,
    // changeMaxQty: T.func,

    // time: T.number,
    // changeTime: T.func,

    // unitTimeId: T.string,
    // changeUnitTimeId: T.func,

    // contents: T.string,
    // changeContents: T.func,

    // packing: T.string,
    // changePacking: T.func,

    // manufact: T.string,
    // changeManufact: T.func,

    // manufact: T.string,
    // changeManufact: T.func,

    // designate: T.string,
    // changeDesignate: T.func,

    // contraind: T.string,
    // changeContraind: T.func,

    // dosage: T.string,
    // changeDosage: T.func,

    // warned: T.string,
    // changeWarned: T.func,

    // interact: T.string,
    // changeInteract: T.func,

    // pregb: T.string,
    // changePregb: T.func,

    // effect: T.string,
    // changeEffect: T.func,

    // overdose: T.string,
    // changeOverdose: T.func,

    // storages: T.string,
    // changeStorages: T.func,

    checkValidate: T.func,
    submitMaster: T.func
}

export default InsImportView;