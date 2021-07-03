import { makeStyles } from '@material-ui/core/styles'

export default makeStyles(theme => ({
    rootSearch: {
        display: 'flex',
        alignItems: 'center',
        width: '300px',
        height: '45px',
    },

    searchInput: {
        marginLeft: '10px',
        flex: 1,
        textTransform: 'uppercase',
    },
    iconButton: {
        padding: '10px',
    },
    upperCase: {
        textTransform: 'uppercase',
    },
}))
