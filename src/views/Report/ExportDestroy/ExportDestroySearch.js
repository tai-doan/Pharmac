import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import { Grid } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import moment from 'moment'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import SearchIcon from '@material-ui/icons/Search';
import LoopIcon from '@material-ui/icons/Loop';

const ExportDestroySearch = ({ handleSearch, process = false }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        start_dt: moment().subtract(1, 'month').toString(),
        end_dt: moment().toString(),
        supplier_nm: '',
        supplier_id: null,
        invoice_no: '',
        invoice_status: '%',
        product_id: null,
        product_nm: ''
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

    const handleSelectSupplier = obj => {
        const newSearchModal = { ...searchModal }
        newSearchModal['supplier_id'] = !!obj ? obj?.o_1 : null
        newSearchModal['supplier_nm'] = !!obj ? obj?.o_2 : ''
        setSearchModal(newSearchModal)
    }

    const handleSelectProduct = obj => {
        const newSearchModal = { ...searchModal }
        newSearchModal['product_id'] = !!obj ? obj?.o_1 : null
        newSearchModal['product_nm'] = !!obj ? obj?.o_2 : ''
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
                            onKeyPress={key => {
                                if (key.which === 13) return handleSearch(searchModal)
                            }}
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
                            onKeyPress={key => {
                                if (key.which === 13) return handleSearch(searchModal)
                            }}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs>
                    <FormControl margin="dense" variant="outlined" className='w-100'>
                        <InputLabel id="reason_tp">{t('order.exportDestroy.reason_tp')}</InputLabel>
                        <Select
                            labelId="reason_tp"
                            id="reason_tp-select"
                            value={searchModal.reason_tp || '%'}
                            onChange={handleChange}
                            label={t('order.exportDestroy.reason_tp')}
                            name='reason_tp'
                        >
                            <MenuItem value="%">{t('all')}</MenuItem>
                            <MenuItem value="1">{t('order.exportDestroy.cancel_by_out_of_date')}</MenuItem>
                            <MenuItem value="2">{t('order.exportDestroy.cancel_by_lost_goods')}</MenuItem>
                            <MenuItem value="3">{t('order.exportDestroy.cancel_by_inventory_balance')}</MenuItem>
                            <MenuItem value="4">{t('other_reason')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs>
                    <TextField
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('invoice_no')}
                        onChange={handleChange}
                        onKeyPress={key => {
                            if (key.which === 13) return handleSearch(searchModal)
                        }}
                        value={searchModal.invoice_no}
                        name='invoice_no'
                        variant="outlined"
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <FormControl margin="dense" variant="outlined" className='w-100'>
                        <InputLabel id="status">{t('invoice_status')}</InputLabel>
                        <Select
                            labelId="status"
                            id="status-select"
                            value={searchModal.invoice_status || '%'}
                            onChange={handleChange}
                            onKeyPress={key => {
                                if (key.which === 13) return handleSearch(searchModal)
                            }}
                            label={t('invoice_status')}
                            name='invoice_status'
                        >
                            <MenuItem value="%">{t('all')}</MenuItem>
                            <MenuItem value="1">{t('normal')}</MenuItem>
                            <MenuItem value="2">{t('cancelled')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <Product_Autocomplete
                        value={searchModal.product_nm || ''}
                        style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                        size={'small'}
                        label={t('menu.product')}
                        onSelect={handleSelectProduct}
                        onKeyPress={key => {
                            if (key.which === 13) return handleSearch(searchModal)
                        }}
                    />
                </Grid>
                <Grid item className='d-flex align-items-center'>
                    <Button className={process ? 'button-loading' : ''} endIcon={process ? <LoopIcon /> : <SearchIcon />} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => handleSearch(searchModal)} variant="contained">{t('search_btn')}</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default ExportDestroySearch;
