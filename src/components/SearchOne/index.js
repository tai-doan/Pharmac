import { Grid, TextField, Button } from '@material-ui/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SearchOne = ({ label, name, searchSubmit }) => {
    const { t } = useTranslation()
    const [searchValue, setSearchValue] = useState('')

    return (
        <Grid container spacing={2}>
            <Grid item>
                <TextField
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
                <Button style={{ backgroundColor: 'green', color: '#fff' }} onClick={() => searchSubmit(searchValue)} variant="contained">{t('search_btn')}</Button>
            </Grid>
        </Grid>
    )
}

export default SearchOne;
