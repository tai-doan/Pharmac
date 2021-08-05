import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Select, FormControl, MenuItem, InputLabel, Button } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
import LoopIcon from '@material-ui/icons/Loop';

const PharmacySearch = ({ handleSearch, process = false }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({ status: '%' })

    const handleChange = e => {
        const newSearchModal = { ...searchModal }
        newSearchModal[e.target.name] = e.target.value
        setSearchModal(newSearchModal)
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <FormControl margin="dense" variant="outlined" className='w-100'>
                        <InputLabel id="status">{t('pharmacy.approve_status')}</InputLabel>
                        <Select
                            labelId="status"
                            id="status-select"
                            value={searchModal.status || '%'}
                            onChange={handleChange}
                            label={t('pharmacy.approve_status')}
                            name='pharmacyStatus'
                            onKeyPress={key => {
                                if (key.which === 13) return handleSearch(searchModal)
                            }}
                        >
                            <MenuItem value="%">{t('all')}</MenuItem>
                            <MenuItem value="0">{t('pharmacy.approve')}</MenuItem>
                            <MenuItem value="1">{t('pharmacy.reject')}</MenuItem>
                            <MenuItem value="1">{t('pharmacy.waiting')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item className='d-flex align-items-center'>
                    <Button className={process ? 'button-loading' : ''} endIcon={process ? <LoopIcon /> : <SearchIcon />} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => handleSearch(searchModal)} variant="contained">{t('search_btn')}</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default PharmacySearch;
