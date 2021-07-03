import React from 'react'
import style from './WarnTime.module.css'
import { useTranslation } from 'react-i18next'
import T from 'prop-types'
import AddIcon from '@material-ui/icons/Add'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Fab from '@material-ui/core/Fab'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import NumberFormat from 'react-number-format'
import ColumnCtrComp from '../../../components/_ColumnCtr'
import glb_sv from '../../../utils/service/global_service'

const WarnTimeView = ({
    tableCol,
    id,
    data,
    dataProduct,
    dataUnit,
    totalRecords,
    handleCheckChangeColumnsView,
    handleQueryNext,
    processing,

    valueSearch,
    changeSearch,
    //props cho các action nghiệp vụ

    productName,
    openDialogIns,
    changeDialogIns,

    openDialogRemove,
    changeDialogRemove,

    productId,
    changeProductId,

    time,
    changeTime,

    code,
    changeCode,

    timeDefault,
    changeTimeDefault,

    unitTimeDefault,
    changeUnitTimeDefault,

    checkValidateTimeDefault,
    submitTimeDefault,

    checkValidate,
    submitFunct,
    removeFunct,
}) => {
    const { t } = useTranslation()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const handleClickColumns = event => {
        setAnchorEl(event.currentTarget)
    }
    const handleCloseColumns = () => {
        setAnchorEl(null)
    }

    return (
        <>
            {/* warn time defalt */}
            <div className="d-flex align-items-center">
                <h6 className="font-weight-bold m-0">{t('config.warnTime.titleDefault')}</h6>
                <NumberFormat
                    style={{ width: '100px' }}
                    className="ml-3"
                    required
                    value={timeDefault}
                    label={t('config.warnTime.timeDefault')}
                    customInput={TextField}
                    autoComplete="off"
                    margin="dense"
                    type="text"
                    variant="outlined"
                    thousandSeparator={true}
                    onValueChange={changeTimeDefault}
                    inputProps={{
                        min: 0,
                    }}
                />
                <TextField
                    className="ml-3"
                    select
                    variant="outlined"
                    margin="dense"
                    label={t('config.warnTime.unit')}
                    value={unitTimeDefault || ''}
                    onChange={changeUnitTimeDefault}
                >
                    {dataUnit.map(row => (
                        <MenuItem key={row.id} value={row.id}>
                            {row.name}
                        </MenuItem>
                    ))}
                </TextField>
                <Button
                    onClick={submitTimeDefault}
                    variant="contained"
                    disabled={checkValidateTimeDefault()}
                    className={[checkValidateTimeDefault() === false ? 'bg-success text-white' : '', 'ml-3'].join(' ')}
                >
                    {t('btn.save')}
                </Button>
            </div>

            <small className="text-danger">{t('config.warnTime.titleNote')}</small>
            {/* warn time */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="font-weight-bold m-0">{t('config.warnTime.titleList')}</h6>
                <div className="d-flex align-items-center">
                    <TextField
                        label={t('lbl.search')}
                        value={valueSearch}
                        onChange={changeSearch}
                        autoComplete="off"
                        variant="outlined"
                        size="small"
                        type="search"
                    />
                    <IconButton onClick={handleClickColumns}>
                        <MoreVertIcon />
                    </IconButton>

                    <ColumnCtrComp
                        anchorEl={anchorEl}
                        columns={tableCol}
                        handleClose={handleCloseColumns}
                        checkColumnChange={handleCheckChangeColumnsView}
                    />
                </div>
            </div>

            {/* table */}
            <Paper className="mb-3">
                <TableContainer style={{ maxHeight: 'calc(100vh - 310px)' }}>
                    <Table stickyHeader>
                        <caption
                            className={['text-center text-danger border-bottom', data.length > 0 ? 'd-none' : ''].join(
                                ' '
                            )}
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
                                // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((item, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            {tableCol.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        case 'warn_amt':
                                                            return (
                                                                <TableCell
                                                                    nowrap="true"
                                                                    key={indexRow}
                                                                    align={col.align}
                                                                >
                                                                    {value} {item.warn_time_tp_nm} ({item.warn_time_tp})
                                                                </TableCell>
                                                            )
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
                                                                        onClick={e => {
                                                                            changeDialogIns(item)
                                                                        }}
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
            </Paper>

            <Button variant="outlined" className="float-left mr-2">
                {'(' + data.length + '/' + totalRecords + ' Dòng)'}
            </Button>
            <Button onClick={handleQueryNext} variant="contained" color="default" className="float-left">
                {processing ? t('loading') : t('Lấy thêm dữ liệu?')}
            </Button>
            {/* ---------------------- */}
            <Tooltip title={t('btn.add')} placement="top">
                <Fab
                    color="primary"
                    className="fixedIcon"
                    onClick={e => {
                        changeDialogIns({ id: 0 })
                    }}
                >
                    <AddIcon />
                </Fab>
            </Tooltip>

            {/* add and edit */}
            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={openDialogIns}
                onClose={e => {
                    changeDialogIns(false)
                }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t(id === 0 ? 'config.warnTime.titleAdd' : 'config.warnTime.titleEdit', { name: productName })}
                </DialogTitle>
                <DialogContent className="pt-0">
                    <TextField
                        fullWidth={true}
                        select
                        variant="outlined"
                        margin="dense"
                        label={t('config.warnTime.time')}
                        value={productId || ''}
                        onChange={changeProductId}
                        className={id === 0 ? 'd-flex' : 'd-none'}
                    >
                        {dataProduct.map(item => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.prod_nm}
                            </MenuItem>
                        ))}
                    </TextField>

                    <div className="row">
                        <div className="col-6">
                            <NumberFormat
                                required
                                fullWidth={true}
                                value={time}
                                label={t('config.warnTime.time')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                onValueChange={changeTime}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </div>
                        <div className="col-6">
                            <TextField
                                fullWidth={true}
                                select
                                variant="outlined"
                                margin="dense"
                                label={t('config.warnTime.unit')}
                                value={code || ''}
                                onChange={changeCode}
                            >
                                {dataUnit.map(row => (
                                    <MenuItem key={row.id} value={row.id}>
                                        {row.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={e => {
                            changeDialogIns(false)
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button
                        onClick={submitFunct}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* remove */}
            <Dialog
                open={openDialogRemove}
                onClose={e => {
                    changeDialogRemove(false)
                }}
            >
                <DialogContent>
                    <DialogContentText className="m-0 text-dark">
                        {t('config.warnTime.titleRemove', { name: productName })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={e => {
                            changeDialogRemove(false)
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button onClick={removeFunct} variant="contained" color="secondary">
                        {t('btn.agree')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
WarnTimeView.propTypes = {
    id: T.number,
    data: T.array,
    dataProduct: T.array,
    dataUnit: T.array,

    openDialogIns: T.bool,
    changeDialogIns: T.func,

    openDialogRemove: T.bool,
    changeDialogRemove: T.func,

    productId: T.string,
    changeProductId: T.func,

    time: T.number,
    changeTime: T.func,

    code: T.string,
    changeCode: T.func,

    timeDefault: T.number,
    changeTimeDefault: T.func,

    unitTimeDefault: T.string,
    changeUnitTimeDefault: T.func,

    valueSearch: T.string,
    changeSearch: T.func,

    checkValidateTimeDefault: T.func,
    submitTimeDefault: T.func,

    checkValidate: T.func,
    submitFunct: T.func,
    removeFunct: T.func,
}

export default WarnTimeView
