import React from 'react'
// import style from './Getlist.module.css'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import T from 'prop-types'
import AddIcon from '@material-ui/icons/Add'
import Paper from '@material-ui/core/Paper'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Fab from '@material-ui/core/Fab'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import MenuItem from '@material-ui/core/MenuItem'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import NumberFormat from 'react-number-format'
//---------------------------------------------------
import SearChComp from '../../../components/_Search'
import ColumnCtrComp from '../../../components/_ColumnCtr'
import glb_sv from '../../../utils/service/global_service'

import PaginationView from '../../../components/Pagination'

const useStylesBootstrap = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}))

const GetlistView = ({
    tableCol,
    data,
    totalRecords,
    name,
    product,
    handleChange,
    handleChangeNum,
    dataTypes,
    dataUnits,
    dataConfigUnits,
    isExpanded,
    handleChangeExpand,
    handleCheckChange,
    unitIdRef,
    unitTimeRef,
    minQtyRef,

    // props cho các action nghiệp vụ
    id,
    openDialogIns,
    changeDialogIns,
    checkValidate,
    submitFunct,
    openDialogRemove,
    changeDialogRemove,

    removeFunct,
    searchSubmit,
    setSearchVal,

    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
}) => {
    const { t } = useTranslation()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const handleClickColumns = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleCloseColumns = () => {
        setAnchorEl(null)
    }

    const classes = useStylesBootstrap()
    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="font-weight-bold m-0">{t('product.title')}</h6>
                <div className="d-flex align-items-center">
                    <SearChComp
                        searchSubmit={searchSubmit}
                        setSearchVal={setSearchVal}
                        placeholder={'product.search'}
                    />

                    <Tooltip title={t('btn.showHiddenColumn')}>
                        <IconButton onClick={handleClickColumns}>
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>

                    <ColumnCtrComp
                        anchorEl={anchorEl}
                        columns={tableCol}
                        handleClose={handleCloseColumns}
                        checkColumnChange={handleCheckChange}
                    />
                </div>
            </div>
            <Paper className="mb-1">
                <TableContainer className="tableContainer">
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
                                {tableCol.map((col) => (
                                    <TableCell
                                        nowrap="true"
                                        className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                        key={col.field}
                                    >
                                        {t(col.title)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={item.id}>
                                        {tableCol.map((col, indexrow) => {
                                            if (col.show) {
                                                return col.field === 'action' ? (
                                                    <TableCell nowrap="true" key={indexrow} align={col.align}>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                changeDialogRemove(item)
                                                            }}
                                                        >
                                                            <DeleteIcon color="action" fontSize="small" />
                                                        </IconButton>
                                                        <Link to={'./ins/' + item.id}>
                                                            <EditIcon color="action" fontSize="small" />
                                                        </Link>{' '}
                                                    </TableCell>
                                                ) : (
                                                    <TableCell key={indexrow} align={col.align}>
                                                        {glb_sv.formatValue(item[col.field], col['type'])}
                                                    </TableCell>
                                                )
                                            }
                                        })}
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <PaginationView
                    count={totalRecords}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
            <Tooltip title={t('btn.add')} placement="top">
                {/* <Link to="./ins"> */}
                <Fab
                    color="primary"
                    onClick={(e) => {
                        changeDialogIns({ id: 0 })
                    }}
                    className="fixedIcon"
                >
                    <AddIcon />
                </Fab>
                {/* </Link> */}
            </Tooltip>

            {/* add and edit */}
            <Dialog
                fullWidth={true}
                maxWidth="md"
                open={openDialogIns}
                onClose={(e) => {
                    changeDialogIns(false)
                }}
            >
                <DialogTitle className="titleDialog pb-0">
                    {t(id === 0 ? 'product.titleAdd' : 'product.titleEdit', { name: name })}
                </DialogTitle>
                <DialogContent className={classes.root + ' pt-0'}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                required
                                autoFocus
                                autoComplete="off"
                                margin="dense"
                                label={t('product.name')}
                                onChange={handleChange}
                                value={product.name}
                                name="name"
                                variant="outlined"
                                className="uppercaseInput"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                required
                                select
                                variant="outlined"
                                margin="dense"
                                label={t('product.type')}
                                name="type"
                                value={product.type || ''}
                                onChange={handleChange}
                            >
                                {dataTypes.map((item) => (
                                    <MenuItem key={item.id} value={item.id} className="fz14">
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Tooltip placement="top" title={t('product.tooltip.productCode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('product.code')}
                                    onChange={handleChange}
                                    value={product.code}
                                    name="code"
                                    variant="outlined"
                                    className="uppercaseInput"
                                />
                            </Tooltip>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Tooltip placement="top" title={t('product.tooltip.barcode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('product.barcode')}
                                    onChange={handleChange}
                                    value={product.barcode}
                                    name="barcode"
                                    variant="outlined"
                                />
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('product.contents')}
                                onChange={handleChange}
                                value={product.contents}
                                name="contents"
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('product.packing')}
                                onChange={handleChange}
                                value={product.packing}
                                name="packing"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('product.manufact')}
                                onChange={handleChange}
                                value={product.manufact}
                                name="manufact"
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={2}>
                            <NumberFormat
                                fullWidth={true}
                                label={t('product.store_current')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                value={product.storeQty}
                                onValueChange={(evt) => handleChangeNum(evt, 'storeQty')}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth={true}
                                select
                                variant="outlined"
                                margin="dense"
                                label={t('product.unit')}
                                value={product.unitId}
                                name="unitId"
                                onChange={handleChange}
                                inputRef={unitIdRef}
                            >
                                {dataUnits.map((item) => (
                                    <MenuItem key={item.id} value={item.id} className="fz14">
                                        {item.unit_nm}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <NumberFormat
                                fullWidth={true}
                                label={t('report.import_order.price')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                value={product.impPrice}
                                onValueChange={(val) => handleChangeNum(val, 'impPrice')}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <NumberFormat
                                fullWidth={true}
                                label={t('config.price.price')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                value={product.expPrice}
                                onValueChange={(val) => handleChangeNum(val, 'expPrice')}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('report.import_order.lot_no')}
                                onChange={handleChange}
                                value={product.lotno}
                                name="manufact"
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                autoComplete="off"
                                label={t('report.warn_exp.exp_dt')}
                                onChange={handleChange}
                                value={product.expDt}
                                name="manufact"
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    {/* Hạn mức kho tối thiểu, tối đa, mốc cảnh báo HSD, đơn vị thời gian cảnh báo */}
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <NumberFormat
                                fullWidth={true}
                                label={t('config.storeLimit.minQuantity')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                value={product.minQty}
                                inputRef={minQtyRef}
                                onValueChange={(val) => handleChangeNum(val, 'minQty')}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <NumberFormat
                                fullWidth={true}
                                label={t('config.storeLimit.maxQuantity')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                value={product.maxQty}
                                onValueChange={(val) => handleChangeNum(val, 'maxQty')}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <NumberFormat
                                fullWidth={true}
                                label={t('menu.configWarn')}
                                customInput={TextField}
                                autoComplete="off"
                                margin="dense"
                                type="text"
                                variant="outlined"
                                thousandSeparator={true}
                                value={product.configWarn}
                                onValueChange={(val) => handleChangeNum(val, 'configWarn')}
                                inputProps={{
                                    min: 0,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth={true}
                                select
                                variant="outlined"
                                margin="dense"
                                label={t('menu.configUnit')}
                                value={product.configUnit}
                                name="configUnit"
                                onChange={handleChange}
                                inputRef={unitTimeRef}
                            >
                                {dataConfigUnits.map((item) => (
                                    <MenuItem key={item.id} value={item.id} className="fz14">
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Accordion expanded={isExpanded} onChange={handleChangeExpand}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                            height="50px"
                        >
                            <Typography className={classes.heading}>{t('product.infoExpand')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="pt-0 pb-0">
                            <Grid container className={classes.root} spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.designate')}
                                        onChange={handleChange}
                                        value={product.designate}
                                        name="designate"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.contraind')}
                                        onChange={handleChange}
                                        value={product.contraind}
                                        name="contraind"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                        <AccordionDetails className="pt-0 pb-0">
                            <Grid container className="{classes.root}" spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.dosage')}
                                        onChange={handleChange}
                                        value={product.dosage}
                                        name="dosage"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.warned')}
                                        onChange={handleChange}
                                        value={product.warned}
                                        name="warned"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                        <AccordionDetails className="pt-0 pb-0">
                            <Grid container className={classes.root} spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.interact')}
                                        onChange={handleChange}
                                        value={product.interact}
                                        name="interact"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.pregb')}
                                        onChange={handleChange}
                                        value={product.pregb}
                                        name="pregb"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                        <AccordionDetails className="pt-0">
                            <Grid container className="{classes.root}" spacing={2}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.effect')}
                                        onChange={handleChange}
                                        value={product.effect}
                                        name="effect"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        multiline
                                        autoComplete="off"
                                        label={t('product.overdose')}
                                        onChange={handleChange}
                                        value={product.overdose}
                                        name="overdose"
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(e) => {
                            changeDialogIns(false)
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button
                        onClick={() => submitFunct(false)}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    {(!id || id === 0) && (
                        <Button
                            onClick={() => submitFunct(true)}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('Lưu & tiếp tục')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* remove */}
            <Dialog
                open={openDialogRemove}
                onClose={(e) => {
                    changeDialogRemove(false)
                }}
            >
                <DialogContent>
                    <DialogContentText className="m-0 text-dark">
                        {t('product.titleRemove', { name: name })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(e) => {
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

GetlistView.propTypes = {
    tableCol: T.array,
    data: T.array,
    totalRecords: T.number,
    name: T.string,
    product: T.object,
    handleChange: T.func,
    handleChangeNum: T.func,
    isExpanded: T.bool,
    handleChangeExpand: T.func,
    handleCheckChange: T.func,

    dataTypes: T.array,
    dataUnits: T.array,
    dataConfigUnits: T.array,

    id: T.number,
    openDialogIns: T.bool,
    changeDialogIns: T.func,
    checkValidate: T.func,
    submitFunct: T.func,
    unitIdRef: T.any,
    unitTimeRef: T.any,
    minQtyRef: T.any,

    openDialogRemove: T.bool,
    changeDialogRemove: T.func,

    removeFunct: T.func,
    searchSubmit: T.func,
    setSearchVal: T.func,

    rowsPerPage: T.number,
    page: T.number,
    handleChangePage: T.func,
    handleChangeRowsPerPage: T.func,
}

export default GetlistView
