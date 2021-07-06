import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

import ImportAdd from './ImportAdd'

const ImportSearch = ({ handleSearch }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        start_dt: moment().day(-14).toString(),
        end_dt: moment().toString(),
        id_status: '1',
        vender_nm: ''
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
        <Accordion className='pb-2' expanded={isExpanded} onChange={handleChangeExpand}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                height="50px"
            >
                <Typography className={''}>{t('search_information')}</Typography>
            </AccordionSummary>
            <AccordionDetails className="pt-0 pb-0">
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
                                label={t('order.import.start_date')}
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
                                label={t('order.import.end_date')}
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
                            <InputLabel id="status">{t('order.import.invoice_type')}</InputLabel>
                            <Select
                                labelId="status"
                                id="status-select"
                                value={searchModal.id_status || 'Y'}
                                onChange={handleChange}
                                label={t('order.import.invoice_type')}
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
                            label={t('order.import.vender_nm')}
                            onChange={handleChange}
                            onKeyPress={key => {
                                if (key.which === 13) return handleSearch(searchModal)
                            }}
                            value={searchModal.vender_nm}
                            name='vender_nm'
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </AccordionDetails>
            <AccordionDetails className="pt-0 pb-0">
                <div className='d-flex search-area-action'>
                    <Button size="small" style={{ backgroundColor: 'green', color: '#fff' }} onClick={() => handleSearch(searchModal)} variant="contained">{t('search_btn')}</Button>
                    <ImportAdd />
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

export default ImportSearch;
