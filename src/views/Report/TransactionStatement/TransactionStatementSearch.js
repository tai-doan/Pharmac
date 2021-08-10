import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, TextField, Button} from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import moment from 'moment'
import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import SearchIcon from '@material-ui/icons/Search';
import LoopIcon from '@material-ui/icons/Loop';

const TransactionStatementSearch = ({ handleSearch, process = false }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        start_dt: moment().subtract(1, 'month').toString(),
        end_dt: moment().toString(),
        product_nm: '',
        product_id: null
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

    const handleSelectProduct = obj => {
        const newSearchModal = { ...searchModal }
        newSearchModal['product_id'] = !!obj ? obj?.o_1 : null
        newSearchModal['product_nm'] = !!obj ? obj?.o_2 : ''
        setSearchModal(newSearchModal)
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={3}>
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
                <Grid item xs={3}>
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
                <Grid item xs={3} className='d-flex align-items-center'>
                    <Button className={process ? 'button-loading' : ''} endIcon={process ? <LoopIcon /> : <SearchIcon />} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => handleSearch(searchModal)} variant="contained">{t('search_btn')}</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default TransactionStatementSearch;
