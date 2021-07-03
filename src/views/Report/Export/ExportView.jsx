import React from 'react'
// import style from './Unit.module.css'
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
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ColumnCtrComp from '../../../components/_ColumnCtr'
import DatePicker from '../../../components/InputCustom/DatePicker'

import glb_sv from '../../../utils/service/global_service'
import { Grid } from '@material-ui/core'
import moment from 'moment'

const ExportView = ({
    tableCol,
    data,
    id,
    openDialogIns,
    changeDialogIns,
    handleQueryNext,
    processing,

    valueSearch,
    changeSearch,

    totalRecords,
    handleCheckChangeColumnsView,

    dateSearchStat,
    changeDateSearchStat,

    dateSearchEnd,
    changeDateSearchEnd
    // props cho các action nghiệp vụ

}) => {
    const { t } = useTranslation()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [selectedDate, setSelectedDate] = React.useState(moment(dateSearchStat));
    const [selectedDateEnd, setSelectedDateEnd] = React.useState(moment(dateSearchEnd));
    const handleClickColumns = event => {
        setAnchorEl(event.currentTarget)
    }
    const handleCloseColumns = () => {
        setAnchorEl(null)
    }

    const handleDateChange = (date) => {
        // console.log("date1", moment(new Date(date)).format('YYYYMMDD'));
        changeDateSearchStat(moment(new Date(date)).format('YYYYMMDD'))
        setSelectedDate(date);
    };
    const handleDateChangeEnd = (date) => {
        // console.log("date2", moment(new Date(date)).format('YYYYMMDD'));
        changeDateSearchEnd(moment(new Date(date)).format('YYYYMMDD'))
        setSelectedDateEnd(date);
    };
    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="font-weight-bold m-0">{t('report.export_order.title')}</h6>
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
            <Grid container spacing={2} className="mb-3">
                <DatePicker 
                    columnswidth={3}
                    disableToolbar
                    variant="inline"    
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Ngày bắt đầu"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}/>
                <DatePicker 
                    columnswidth={3}
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Ngày kết thúc"
                    value={selectedDateEnd}
                    onChange={handleDateChangeEnd}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}/>
            </Grid>
            {/* table */}
            <Paper className="mb-3">
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
        </>
    )
}

ExportView.propTypes = {
    tableCol: T.array,
    data: T.array,
    id: T.number,
    totalRecords: T.number,
    handleCheckChangeColumnsView: T.func,

    valueSearch: T.string,
    changeSearch: T.func,

    handleQueryNext: T.func,
    processing: T.bool,
}

export default ExportView
