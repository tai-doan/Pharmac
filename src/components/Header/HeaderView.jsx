import React from 'react'
import style from './Header.module.css'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import InputBase from '@material-ui/core/InputBase'
import { fade, makeStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
// import FullscreenIcon from '@material-ui/icons/Fullscreen';
// import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import StoreIcon from '@material-ui/icons/Store'
import LocalShippingIcon from '@material-ui/icons/LocalShipping'
import TranslateIcon from '@material-ui/icons/Translate'
// import glb_sv from "../../utils/service/global_service";

import { ReactComponent as IC_IMPORT } from '../../asset/images/import.svg'

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}))

const HeaderView = () => {
    const classes = useStyles()

    const { t, i18n } = useTranslation()

    const [anchorLanguage, setAnchorLanguage] = React.useState(null)

    const showMenuLanguage = event => {
        setAnchorLanguage(event.currentTarget)
    }

    const closeMenuLanguage = e => {
        setAnchorLanguage(null)
        if (e !== -1) {
            i18n.changeLanguage(e === 0 ? 'vn' : 'en')
        }
    }

    return (
        <>
            <div className={['d-flex justify-content-end p-2', style.bgHeader].join(' ')}>
                {/* <div className={[classes.search, 'mr-2 text-white'].join(' ')}>
                    <div className={classes.searchIcon}>
                        <SearchIcon />
                    </div>
                    <InputBase
                        placeholder={t('lbl.search')}
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                    />
                </div> */}
                {/* <Link to="/page/order/import" className="mr-2 text-decoration-none"> */}
                <Link to="/page/order/ins-import" className="mr-2 text-decoration-none">
                    <Button startIcon={<IC_IMPORT />} className="text-white">
                        {t('header.import')}
                    </Button>
                </Link>
                {/* <Link to="/page/order/export" className="mr-2 text-decoration-none"> */}
                <Link to="/page/order/ins-export" className="mr-2 text-decoration-none">
                    <Button startIcon={<LocalShippingIcon />} className={style.export}>
                        {t('header.export')}
                    </Button>
                </Link>
                <div className="position-relative">
                    <Button
                        className={[style.language, 'text-info'].join(' ')}
                        startIcon={<TranslateIcon />}
                        endIcon={<ExpandMoreIcon />}
                        onClick={showMenuLanguage}
                    >
                        {i18n.language === 'vn' ? t('language.vn') : t('language.en')}
                    </Button>
                    <Menu
                        anchorEl={anchorLanguage}
                        open={Boolean(anchorLanguage)}
                        onClose={() => {
                            closeMenuLanguage(-1)
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                closeMenuLanguage(0)
                            }}
                            selected={i18n.language === 'vn'}
                        >
                            {t('language.vn')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                closeMenuLanguage(1)
                            }}
                            selected={i18n.language === 'en'}
                        >
                            {t('language.en')}
                        </MenuItem>
                    </Menu>
                </div>

                {/* <Button onClick={() => glb_sv.fullScreen(glb_sv.checkFullScreen)}>
                    {glb_sv.checkFullScreen === false ? <><FullscreenIcon /> </> : <><FullscreenExitIcon /> </>}
                </Button> */}
            </div>
        </>
    )
}

export default HeaderView
