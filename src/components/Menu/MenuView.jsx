import React, { lazy } from 'react'
import style from './Menu.module.css'
import { useTranslation } from 'react-i18next'
import { useHistory } from "react-router-dom";
import { Link } from 'react-router-dom'
import T from 'prop-types'

import DashboardIcon from '@material-ui/icons/Dashboard'
import ViewListIcon from '@material-ui/icons/ViewList'
import ReceiptIcon from '@material-ui/icons/Receipt'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import AssessmentIcon from '@material-ui/icons/Assessment'
import SettingsIcon from '@material-ui/icons/Settings'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow'
import glb_sv from '../../utils/service/global_service'

const SubMenuView = lazy(() => import('../SubMenu/index'))

const menuList = [
    {
        title: 'menu.dashboard',
        icon: <DashboardIcon className="icon-menu"></DashboardIcon>,
        link: 'dashboard',
        key: 'dashboard',
        children: [],
    },
    {
        title: 'menu.product',
        icon: <ViewListIcon className="icon-menu"></ViewListIcon>,
        link: 'products/product',
        key: 'products',
        children: [
            { title: 'menu.product', link: 'products/product', key: 'product' },
            { title: 'menu.productGroup', link: 'products/product-group', key: 'productGroup' },
        ],
    },
    {
        title: 'menu.order',
        icon: <ReceiptIcon className="icon-menu"></ReceiptIcon>,
        link: 'order',
        key: 'order',
        children: [
            { title: 'menu.importOrder', link: 'order/import', key: 'importOrder' },
            { title: 'menu.importinven', link: 'order/import-inventory', key: 'importinventory' },
            { title: 'menu.exportOrder', link: 'order/export', key: 'exportOrder' },
            { title: 'menu.exportRepay', link: 'order/export-repay', key: 'exportRepay' },
            { title: 'menu.exportDestroy', link: 'order/export-destroy', key: 'exportDestroy' },
        ],
    },
    {
        title: 'menu.partner',
        icon: <SupervisorAccountIcon className="icon-menu"></SupervisorAccountIcon>,
        link: 'partner',
        key: 'partner',
        children: [
            { title: 'menu.customer', link: 'partner/customer', key: 'customer' },
            { title: 'menu.supplier', link: 'partner/supplier', key: 'supplier' },
        ],
    },
    {
        title: 'menu.settlement',
        icon: <AttachMoneyIcon className="icon-menu"></AttachMoneyIcon>,
        link: 'settlement',
        key: 'settlement',
        children: [
            { title: 'menu.settlImp', link: 'settlement/import', key: 'settlImp' },
            { title: 'menu.settlExp', link: 'settlement/export', key: 'settlExp' },
            { title: 'menu.settlExpRepay', link: 'settlement/repay', key: 'settlExpRepay' },
        ],
    },
    {
        title: 'menu.report',
        icon: <AssessmentIcon className="icon-menu"></AssessmentIcon>,
        link: 'report',
        key: 'report',
        children: [
            { title: 'menu.reportImportOrder', link: 'report/import', key: 'reportImportOrder' },
            { title: 'menu.reportImportInven', link: 'report/import-inventory', key: 'reportImportInven' },
            { title: 'menu.reportExportOrder', link: 'report/export', key: 'reportExportOrder' },
            { title: 'menu.reportExportRepay', link: 'report/export-repay', key: 'reportExportRepay' },
            { title: 'menu.reportExportDestroy', link: 'report/export-destroy', key: 'reportExportDestroy' },
            { title: 'import_payment', link: 'report/import-payment', key: 'reportImportPayment' },
            { title: 'collecting_sales', link: 'report/collect-sales', key: 'reportCollectSales' },
            { title: 'collecting_import_repay', link: 'report/collect-returns', key: 'reportCollectReturn' },
            { title: 'menu.reportInventory', link: 'report/inventory', key: 'reportInventory' },
            { title: 'menu.reportTransactionStatement', link: 'report/transaction-statement', key: 'reportTransactionStatement' },
            // { title: 'menu.reportImportInven', link: 'report/import-order-inven', key: 'reportImportInven' },
            // { title: 'menu.reportExportOrder', link: 'report/export-order', key: 'reportExportOrder' },
            // { title: 'menu.reportSettlement', link: 'report/export-order-settl', key: 'reportSettlement' },
        ],
    },
    {
        title: 'menu.config',
        icon: <SettingsIcon className="icon-menu"></SettingsIcon>,
        link: 'config/unit',
        key: 'config',
        children: [
            { title: 'menu.configUnit', link: 'config/unit', key: 'configUnit' },
            { title: 'menu.configUnitRate', link: 'config/unit-rate', key: 'configUnitRate' },
            { title: 'menu.configStoreLimit', link: 'config/store-limit', key: 'configStoreLimit' },
            { title: 'menu.configPrice', link: 'config/price', key: 'configPrice' },
            { title: 'menu.configWarn', link: 'config/warn-time', key: 'configWarn' },
        ],
    },
]

const MenuView = ({ baseLink }) => {
    const { t } = useTranslation()
    let history = useHistory();

    let menu = menuList.reduce((n, o, i) => {
        n[o.key] = o
        return n
    }, [])

    let keyActive = window.location.pathname.split('/')

    keyActive = keyActive.length === 2 ? 'dashboard' : keyActive[2]

    const [itemActive, setItemActive] = React.useState(menu[keyActive])

    const [anchorEl, setAnchorEl] = React.useState(null)

    const [expand, setExpand] = React.useState(true)

    React.useEffect(() => {
        glb_sv.commonEvent.subscribe((msg) => {
            if (msg.msgTp === glb_sv.setExpand) {
                setExpand(msg.data)
            }
        })
    })

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const changeMenu = (item) => {
        setItemActive(item)
    }

    const changeExpand = (event) => {
        console.log('changeExpand', event)
        //-- true -> collaps, false -> expand
        setExpand(event ? false : true)
    }

    return (
        <div
            className={['d-flex', style.iconExpand].join(' ')}
            style={{ width: itemActive.children.length > 0 && expand === true ? '285px' : '100px' }}
        >
            <div className={style.menu}>
                <div className={style.navbar_item_logo}>
                    <img src={require('../../asset/images/favicon.png')} className="h-100" alt="" />
                </div>
                <div className={style.navbar}>
                    {menuList.map((item, index) => {
                        return (
                            <React.Fragment key={item.key}>
                                <Link
                                    to={baseLink + item.link}
                                    onClick={(e) => {
                                        setExpand(true)
                                    }}
                                    className="text-decoration-none text-dark"
                                >
                                    <div
                                        className={style.navbar__item}
                                        key={item.key}
                                        onClick={(e) => {
                                            changeMenu(item)
                                        }}
                                    >
                                        <div className={keyActive === item.key ? style.active : ''}>
                                            <div>{item.icon}</div>
                                            <div className={style.navbar_item_text}>{t(item.title)}</div>
                                        </div>
                                    </div>
                                </Link>
                            </React.Fragment>
                        )
                    })}
                </div>

                <div
                    className={['m-1 text-center text-white', style.boxIconExpand, style.active].join(' ')}
                    onClick={() => {
                        changeExpand(expand)
                    }}
                >
                    <div>
                        <DoubleArrowIcon
                            className={[style.iconExpand, expand ? style.open : style.close, 'icon-menu'].join(' ')}
                        ></DoubleArrowIcon>
                    </div>
                </div>

                <div className={[style.navbar_item_avatar].join(' ')}>
                    <div onClick={handleClick}>
                        <img src={require('../../asset/images/man.png')} className={style.avatar} alt="" />
                        <div className={style.userName}>{glb_sv.userNm ? glb_sv.userNm : ''}</div>
                    </div>
                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleClose}>
                            <AccountCircleIcon className="mr-2" /> {t('user.profile')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                glb_sv.authFlag = false
                                sessionStorage.removeItem('0101X10')
                                sessionStorage.removeItem('0101X11')
                                history.push('/login')
                            }}
                        >
                            <ExitToAppIcon className="mr-2" /> {t('user.logout')}
                        </MenuItem>
                    </Menu>
                </div>
            </div>

            <div className={[style.iconExpand, expand === true ? 'w-100' : 'd-none'].join(' ')}>
                <SubMenuView item={itemActive} baseLink={baseLink} onChangeLink={() => setExpand(false)} />
            </div>
        </div>
    )
}

MenuView.propTypes = {
    baseLink: T.string,
}
export default MenuView
