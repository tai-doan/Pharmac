import React, { lazy, useState, useEffect } from 'react'
import style from './Menu.module.css'
import { useTranslation } from 'react-i18next'
import { useHistory } from "react-router-dom";
import { Link } from 'react-router-dom'
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
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

const menuList = [
    {
        title: 'menu.dashboard',
        icon: <DashboardIcon className="icon-menu"></DashboardIcon>,
        link: 'dashboard',
        key: 'dashboard',
        children: [],
        open: false
    },
    {
        title: 'menu.product',
        icon: <ViewListIcon className="icon-menu"></ViewListIcon>,
        link: 'products/product',
        key: 'products',
        children: [
            { title: 'menu.product', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'products/product', key: 'product' },
            { title: 'menu.productGroup', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'products/product-group', key: 'productGroup' },
        ],
        open: false
    },
    {
        title: 'menu.order',
        icon: <ReceiptIcon className="icon-menu"></ReceiptIcon>,
        link: 'order',
        key: 'order',
        children: [
            { title: 'menu.importOrder', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'order/import', key: 'importOrder' },
            { title: 'menu.importinven', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'order/import-inventory', key: 'importinventory' },
            { title: 'menu.exportOrder', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'order/export', key: 'exportOrder' },
            { title: 'menu.exportRepay', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'order/export-repay', key: 'exportRepay' },
            { title: 'menu.exportDestroy', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'order/export-destroy', key: 'exportDestroy' },
        ],
        open: false
    },
    {
        title: 'menu.partner',
        icon: <SupervisorAccountIcon className="icon-menu"></SupervisorAccountIcon>,
        link: 'partner',
        key: 'partner',
        children: [
            { title: 'menu.customer', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'partner/customer', key: 'customer' },
            { title: 'menu.supplier', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'partner/supplier', key: 'supplier' },
        ],
        open: false
    },
    {
        title: 'menu.settlement',
        icon: <AttachMoneyIcon className="icon-menu"></AttachMoneyIcon>,
        link: 'settlement',
        key: 'settlement',
        children: [
            { title: 'menu.settlImp', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'settlement/import', key: 'settlImp' },
            { title: 'menu.settlExp', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'settlement/export', key: 'settlExp' },
            { title: 'menu.settlExpRepay', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'settlement/repay', key: 'settlExpRepay' },
        ],
        open: false
    },
    {
        title: 'menu.report',
        icon: <AssessmentIcon className="icon-menu"></AssessmentIcon>,
        link: 'report',
        key: 'report',
        children: [
            { title: 'menu.reportImportOrder', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/import', key: 'reportImportOrder' },
            { title: 'menu.reportImportInven', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/import-inventory', key: 'reportImportInven' },
            { title: 'menu.reportExportOrder', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/export', key: 'reportExportOrder' },
            { title: 'menu.reportExportRepay', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/export-repay', key: 'reportExportRepay' },
            { title: 'menu.reportExportDestroy', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/export-destroy', key: 'reportExportDestroy' },
            { title: 'import_payment', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/import-payment', key: 'reportImportPayment' },
            { title: 'collecting_sales', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/collect-sales', key: 'reportCollectSales' },
            { title: 'collecting_import_repay', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/collect-returns', key: 'reportCollectReturn' },
            { title: 'menu.reportInventory', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/inventory', key: 'reportInventory' },
            { title: 'menu.reportTransactionStatement', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'report/transaction-statement', key: 'reportTransactionStatement' },
        ],
        open: false
    },
    {
        title: 'menu.config',
        icon: <SettingsIcon className="icon-menu"></SettingsIcon>,
        link: 'config/unit',
        key: 'config',
        children: [
            { title: 'menu.configUnit', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'config/unit', key: 'configUnit' },
            { title: 'menu.configUnitRate', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'config/unit-rate', key: 'configUnitRate' },
            { title: 'menu.configStoreLimit', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'config/store-limit', key: 'configStoreLimit' },
            { title: 'menu.configPrice', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'config/price', key: 'configPrice' },
            { title: 'menu.configWarn', icon: <DashboardIcon className="icon-menu"></DashboardIcon>, link: 'config/warn-time', key: 'configWarn' },
        ],
        open: false
    },
]

const MenuView = ({ baseLink }) => {
    const { t } = useTranslation()
    let history = useHistory();
    const [listMenu, setListMenu] = useState(menuList)

    let menu = menuList.reduce((n, o, i) => {
        n[o.key] = o
        return n
    }, [])

    let keyActive = window.location.pathname.split('/')

    keyActive = keyActive.length === 2 ? 'dashboard' : keyActive[2]

    const [itemActive, setItemActive] = useState(menu[keyActive])

    const [anchorEl, setAnchorEl] = useState(null)

    const [expand, setExpand] = useState(true)

    useEffect(() => {
        glb_sv.commonEvent.subscribe((msg) => {
            if (msg.msgTp === glb_sv.setExpand) {
                setExpand(msg.data)
            }
        })
    })

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = (index) => {
        let data = [...listMenu];
        data[index].open = false
        setListMenu(data)
    }

    const handleOpen = (index) => {
        let data = [...listMenu];
        data[index].open = true
        setListMenu(data)
    }

    const changeMenu = (item) => {
        setItemActive(item)
    }

    const changeExpand = (event) => {
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
                    {listMenu.map((item, index) => {
                        return (
                            <React.Fragment key={item.key}>
                                <Link
                                    to={baseLink + item.link}
                                    onClick={(e) => {
                                        setExpand(true)
                                    }}
                                    className="text-decoration-none text-dark"
                                >
                                    <SpeedDial
                                        ariaLabel="SpeedDial example"
                                        className=''
                                        icon={
                                            <div className='d-flex flex-direction-column'>
                                                <div className='d-flex'>
                                                    {item.icon}
                                                </div>
                                                <div className='d-flex'>{t(item.title)}</div>
                                            </div>
                                        }
                                        TransitionComponent='Grow'
                                        FabProps={{
                                            variant: "extended",
                                            style: { borderRadius: 5, color: '#000', backgroundColor: 'transparent' }
                                        }}
                                        onClose={() => handleClose(index)}
                                        onOpen={() => handleOpen(index)}
                                        open={item.open}
                                        direction='right'
                                    >
                                        {item.children.map((action) => (
                                            <SpeedDialAction
                                                key={action.key}
                                                icon={action.icon}
                                                tooltipTitle={t(action.title)}
                                                FabProps={{
                                                    variant: "extended",
                                                    style: { borderRadius: 5, backgroundColor: '#dfdfdf', padding: 5, margin: 5 }
                                                }}
                                                onClick={() => handleClose(index)}
                                            />
                                        ))}
                                    </SpeedDial>
                                </Link>
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default MenuView;
