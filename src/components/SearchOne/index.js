import { Grid, TextField, Button } from '@material-ui/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@material-ui/icons/Search';
import LoopIcon from '@material-ui/icons/Loop';

const SearchOne = ({ label, name, searchSubmit, process = false }) => {
    const { t } = useTranslation()
    const [searchValue, setSearchValue] = useState('')

    return (
        <Grid container spacing={2}>
            <Grid item>
                <TextField
                    className="uppercaseInput"
                    margin="dense"
                    autoComplete="off"
                    label={t(label)}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyPress={key => {
                        if (key.which === 13) return searchSubmit(searchValue)
                    }}
                    value={searchValue || ''}
                    name={name || 'searchOne'}
                    variant="outlined"
                />
            </Grid>
            <Grid item className='d-flex align-items-center'>
                <Button className={process ? 'button-loading' : ''} endIcon={process ? <LoopIcon /> : <SearchIcon />} style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => searchSubmit(searchValue)} variant="contained">{t('search_btn')}</Button>
            </Grid>
        </Grid>
    )
}

export default SearchOne;
