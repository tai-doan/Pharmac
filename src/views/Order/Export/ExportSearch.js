import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import { Grid, Select, FormControl, MenuItem, InputLabel, Typography, AccordionSummary, AccordionDetails, Accordion, Button, TextField } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import moment from 'moment'
import SearchIcon from '@material-ui/icons/Search';

const ExportSearch = ({ handleSearch }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        start_dt: moment().day(-14).toString(),
        end_dt: moment().toString(),
        id_status: '1',
        cust_nm_v: ''
    })
    const [isExpanded, setIsExpanded] = useState(true)

    const handleChangeExpand = () => {
        setIsExpanded(e => !e)
    }

    const handleStartDateChange = date => {
        const newSearchModal = { ...searchModal }
        newSearchModal['start_dt'] = date;
        setSearchModal(newSearchModal)
    }

    const handleEndDateChange = date => {
        const newSearchModal = { ...searchModal }
        newSearchModal['end_dt'] = date;
        setSearchModal(newSearchModal)
    }

    const handleChange = e => {
        const newSearchModal = { ...searchModal }
        newSearchModal[e.target.name] = e.target.value
        setSearchModal(newSearchModal)
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            margin="dense"
                            variant="outlined"
                            style={{ width: '100%' }}
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            id="order_dt-picker-inline"
                            label={t('order.export.start_date')}
                            value={searchModal.start_dt}
                            onChange={handleStartDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            margin="dense"
                            variant="outlined"
                            style={{ width: '100%' }}
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            id="order_dt-picker-inline"
                            label={t('order.export.end_date')}
                            value={searchModal.end_dt}
                            onChange={handleEndDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs>
                    <FormControl margin="dense" variant="outlined" className='w-100'>
                        <InputLabel id="status">{t('order.export.invoice_type')}</InputLabel>
                        <Select
                            labelId="status"
                            id="status-select"
                            value={searchModal.id_status || 'Y'}
                            onChange={handleChange}
                            label={t('order.export.invoice_type')}
                            name='id_status'
                        >
                            <MenuItem value="1">{t('normal')}</MenuItem>
                            <MenuItem value="2">{t('cancelled')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs>
                    <TextField
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('order.export.cust_nm_v')}
                        onChange={handleChange}
                        onKeyPress={key => {
                            if (key.which === 13) return handleSearch(searchModal)
                        }}
                        value={searchModal.cust_nm_v}
                        name='cust_nm_v'
                        variant="outlined"
                    />
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid item>
                    <Button endIcon={<SearchIcon />} size="small" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => handleSearch(searchModal)} variant="contained">{t('search_btn')}</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default ExportSearch;
