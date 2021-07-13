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
import Dictionary_Autocomplete from '../../../components/Dictionary_Autocomplete/index'

const InventorySearch = ({ handleSearch }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        group_id: null,
        group_nm: '',
        lot_no: '',
        invent_yn: 'Y'
    })
    const [isExpanded, setIsExpanded] = useState(true)

    const handleChangeExpand = () => {
        setIsExpanded(e => !e)
    }

    const handleChange = e => {
        const newSearchModal = { ...searchModal }
        newSearchModal[e.target.name] = e.target.value
        setSearchModal(newSearchModal)
    }

    const handleSelectGroup = obj => {
        const newSearchModal = { ...searchModal }
        newSearchModal['group_id'] = !!obj ? obj?.o_1 : null
        newSearchModal['group_nm'] = !!obj ? obj?.o_2 : ''
        setSearchModal(newSearchModal)
    }

    return (
        <>
            <Grid container spacing={2}>
                {/* <Grid item xs>
                    <TextField
                        fullWidth={true}
                        margin="dense"
                        autoComplete="off"
                        label={t('report.lot_no')}
                        onChange={handleChange}
                        onKeyPress={key => {
                            if (key.which === 13) return handleSearch(searchModal)
                        }}
                        value={searchModal.lot_no}
                        name='lot_no'
                        variant="outlined"
                    />
                </Grid> */}
                <Grid item xs={3}>
                    <Dictionary_Autocomplete
                        diectionName='groups'
                        value={searchModal.group_nm || ''}
                        style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                        size={'small'}
                        label={t('menu.productGroup')}
                        onSelect={handleSelectGroup}
                        onKeyPress={key => {
                            if (key.which === 13) return handleSearch(searchModal)
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl margin="dense" variant="outlined" className='w-100'>
                        <InputLabel id="status">{t('report.import_type')}</InputLabel>
                        <Select
                            labelId="status"
                            id="status-select"
                            value={searchModal.invent_yn || 'Y'}
                            onChange={handleChange}
                            onKeyPress={key => {
                                if (key.which === 13) return handleSearch(searchModal)
                            }}
                            label={t('report.import_type')}
                            name='invent_yn'
                        >
                            <MenuItem value="Y">{t('report.all')}</MenuItem>
                            <MenuItem value="N">{t('report.inven')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item className='d-flex align-items-center'>
                    <Button style={{ backgroundColor: 'green', color: '#fff' }} onClick={() => handleSearch(searchModal)} variant="contained">{t('search_btn')}</Button>
                </Grid>
            </Grid>
        </>
    )
}

export default InventorySearch;
