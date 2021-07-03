import React from 'react'
import { useTranslation } from 'react-i18next'
import T from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'

import InputBase from '@material-ui/core/InputBase'
import SearchIcon from '@material-ui/icons/Search'
import useStyles from './Style'
const SearchView = ({ searchStr, placeholder, onSearchChange, onClickSearch }) => {
    const { t } = useTranslation()
    const priCls = useStyles()
    return (
        <Paper component="form" onSubmit={onClickSearch} className={priCls.rootSearch}>
            <InputBase
                value={searchStr}
                className={priCls.searchInput}
                onChange={onSearchChange}
                placeholder={t(placeholder)}
            />
            <IconButton type="submit" className={priCls.iconButton} aria-label="search">
                <SearchIcon />
            </IconButton>
        </Paper>
    )
}

SearchView.propTypes = {
    searchStr: T.string,
    placeholder: T.string,
    onSearchChange: T.func,
    onClickSearch: T.func,
    isUpper: T.bool,
}

export default SearchView
