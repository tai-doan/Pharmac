import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Select, FormControl, MenuItem, InputLabel,  Button, TextField } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import SearchIcon from '@material-ui/icons/Search';
import LoopIcon from '@material-ui/icons/Loop';

const UserSearch = ({ handleSearch, process = false }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        branch_id: 0,
        userName: '',
        userStatus: '%'
    })
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)

    const handleChange = e => {
        const newSearchModal = { ...searchModal }
        newSearchModal[e.target.name] = e.target.value
        setSearchModal(newSearchModal)
    }

    return (
        <>
            <Grid container spacing={2}>
                {/* <Grid item xs>
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
                </Grid> */}
                <Grid item xs={3}>
                    <TextField
                        fullWidth={true}
                        autoFocus
                        autoComplete="off"
                        margin="dense"
                        label={t('user.userName')}
                        name='userName'
                        onChange={handleChange}
                        value={searchModal.userName}
                        variant="outlined"
                        className="uppercaseInput"
                        inputRef={step1Ref}
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                step2Ref.current.focus()
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl margin="dense" variant="outlined" className='w-100'>
                        <InputLabel id="status">{t('user.userActiveStatus')}</InputLabel>
                        <Select
                            ref={step2Ref}
                            labelId="status"
                            id="status-select"
                            value={searchModal.userStatus || '%'}
                            onChange={handleChange}
                            label={t('user.userActiveStatus')}
                            name='userStatus'
                        >
                            <MenuItem value="%">{t('all')}</MenuItem>
                            <MenuItem value="0">{t('normal')}</MenuItem>
                            <MenuItem value="1">{t('user.lock_login')}</MenuItem>
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

export default UserSearch;
