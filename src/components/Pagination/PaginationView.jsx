import React from 'react'
import { useTranslation } from 'react-i18next'
import T from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import TablePagination from '@material-ui/core/TablePagination'

const useStyles1 = makeStyles(theme => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5),
    },
    floatLeft: {
        float: 'left',
    },
}))

const TablePaginationActions = ({ count, page, rowsPerPage, onChangePage }) => {
    const classes = useStyles1()
    const theme = useTheme()
    const handleFirstPageButtonClick = event => {
        onChangePage(event, 0)
    }

    const handleBackButtonClick = event => {
        onChangePage(event, page - 1)
    }

    const handleNextButtonClick = event => {
        onChangePage(event, page + 1)
    }

    const handleLastPageButtonClick = event => {
        onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }

    return (
        <div className={classes.root}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
            <div style={{ width: 80, float: 'right' }}></div>
        </div>
    )
}

TablePaginationActions.propTypes = {
    count: T.number.isRequired,
    onChangePage: T.func.isRequired,
    page: T.number.isRequired,
    rowsPerPage: T.number.isRequired,
}

const PaginationView = ({ count, page, rowsPerPage, onChangePage, onChangeRowsPerPage }) => {
    const { t } = useTranslation()
    return (
        <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            colSpan={3}
            count={count}
            component="div"
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage={t('row_per_page')}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
        />
    )
}

PaginationView.propTypes = {
    count: T.number.isRequired,
    onChangePage: T.func.isRequired,
    page: T.number.isRequired,
    rowsPerPage: T.number.isRequired,
    onChangeRowsPerPage: T.func.isRequired,
}

export default PaginationView
