import React, { useState, useEffect } from 'react'
import style from './Menu.module.css'
import { useTranslation } from 'react-i18next'
import { useHistory } from "react-router-dom";
import { Link } from 'react-router-dom'

import { Tooltip, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import glb_sv from '../../utils/service/global_service'

import { ReactComponent as IC_DASHBOARD } from '../../asset/images/dashboard.svg'
import { ReactComponent as IC_PRODUCT } from '../../asset/images/product.svg'
import { ReactComponent as IC_PRODUCT_GROUP } from '../../asset/images/product-group.svg'
import { ReactComponent as IC_IMPORT } from '../../asset/images/import.svg'
import { ReactComponent as IC_IMPORT_INVENTORY } from '../../asset/images/import-inventory.svg'
import { ReactComponent as IC_EXPORT } from '../../asset/images/export.svg'
import { ReactComponent as IC_EXPORT_REPAY } from '../../asset/images/export-repay.svg'
import { ReactComponent as IC_EXPORT_DESTROY } from '../../asset/images/export-destroy.svg'
import { ReactComponent as IC_ORDER } from '../../asset/images/order.svg'
import { ReactComponent as IC_PARTNER } from '../../asset/images/partner.svg'
import { ReactComponent as IC_CUSTOMER } from '../../asset/images/customer.svg'
import { ReactComponent as IC_SUPPLIER } from '../../asset/images/supplier.svg'
import { ReactComponent as IC_SETTLEMENT } from '../../asset/images/settlement.svg'
import { ReactComponent as IC_SETT_IMPORT } from '../../asset/images/sett-import.svg'
import { ReactComponent as IC_SETT_EXPORT_REPAY } from '../../asset/images/sett-export-repay.svg'
import { ReactComponent as IC_REPORT } from '../../asset/images/report.svg'
import { ReactComponent as IC_REPORT_IMPORT } from '../../asset/images/report-import.svg'
import { ReactComponent as IC_REPORT_IMPORT_INVENTORY } from '../../asset/images/report-import-inventory.svg'
import { ReactComponent as IC_REPORT_EXPORT } from '../../asset/images/report-export.svg'
import { ReactComponent as IC_REPORT_EXPORT_REPAY } from '../../asset/images/report-export-repay.svg'
import { ReactComponent as IC_REPORT_EXPORT_DESTROY } from '../../asset/images/report-export-destroy.svg'
import { ReactComponent as IC_REPORT_IMPORT_PAYMENT } from '../../asset/images/report-import-payment.svg'
import { ReactComponent as IC_REPORT_COLLECT_MONEY } from '../../asset/images/report-collect-money.svg'
import { ReactComponent as IC_REPORT_TRANSACTION } from '../../asset/images/report-transaction.svg'
import { ReactComponent as IC_CONFIG } from '../../asset/images/config.svg'
import { ReactComponent as IC_UNIT } from '../../asset/images/unit.svg'
import { ReactComponent as IC_UNIT_RATE } from '../../asset/images/unit-rate.svg'
import { ReactComponent as IC_STORE_LIMIT } from '../../asset/images/store-limit.svg'
import { ReactComponent as IC_PRICE } from '../../asset/images/price.svg'
import { ReactComponent as IC_WARN_TIME } from '../../asset/images/warn-time.svg'

const menuList = [
    {
        title: 'menu.dashboard',
        icon: <IC_DASHBOARD />,
        link: 'dashboard',
        key: 'dashboard',
        children: [],
    },
    {
        title: 'menu.product',
        icon: <IC_PRODUCT />,
        link: 'products/product',
        key: 'products',
        children: [
            {
                title: 'menu.product',
                icon: <IC_PRODUCT />,
                link: 'products/product',
                key: 'product'
            },
            {
                title: 'menu.productGroup',
                icon: <IC_PRODUCT_GROUP />,
                link: 'products/product-group',
                key: 'productGroup'
            },
        ],
    },
    {
        title: 'menu.order',
        icon: <IC_ORDER />,
        link: 'order',
        key: 'order',
        children: [
            {
                title: 'menu.importOrder',
                icon: <IC_IMPORT />,
                link: 'order/import',
                key: 'importOrder'
            },
            {
                title: 'menu.importinven',
                icon: <IC_IMPORT_INVENTORY />,
                link: 'order/import-inventory',
                key: 'importinventory'
            },
            {
                title: 'menu.exportOrder',
                icon: <IC_EXPORT />,
                link: 'order/export',
                key: 'exportOrder'
            },
            {
                title: 'menu.exportRepay',
                icon: <IC_EXPORT_REPAY />,
                link: 'order/export-repay',
                key: 'exportRepay'
            },
            {
                title: 'menu.exportDestroy',
                icon: <IC_EXPORT_DESTROY />,
                link: 'order/export-destroy',
                key: 'exportDestroy'
            },
        ],
    },
    {
        title: 'menu.partner',
        icon: <IC_PARTNER />,
        link: 'partner',
        key: 'partner',
        children: [
            {
                title: 'menu.customer',
                icon: <IC_CUSTOMER />,
                link: 'partner/customer',
                key: 'customer'
            },
            {
                title: 'menu.supplier',
                icon: <IC_SUPPLIER />,
                link: 'partner/supplier',
                key: 'supplier'
            },
        ],
    },
    {
        title: 'menu.settlement',
        icon: <IC_SETTLEMENT />,
        link: 'settlement',
        key: 'settlement',
        children: [
            {
                title: 'menu.settlImp',
                icon: <IC_SETT_IMPORT />,
                link: 'settlement/import',
                key: 'settlImp'
            },
            {
                title: 'menu.settlExp',
                icon: <IC_CUSTOMER />,
                link: 'settlement/export',
                key: 'settlExp'
            },
            {
                title: 'menu.settlExpRepay',
                icon: <IC_SETT_EXPORT_REPAY />,
                link: 'settlement/repay',
                key: 'settlExpRepay'
            },
        ],
    },
    {
        title: 'menu.report',
        icon: <IC_REPORT />,
        link: 'report',
        key: 'report',
        children: [
            {
                title: 'menu.reportImportOrder',
                icon: <IC_REPORT_IMPORT />,
                link: 'report/import',
                key: 'reportImportOrder'
            },
            {
                title: 'menu.reportImportInven',
                icon: <IC_REPORT_IMPORT_INVENTORY />,
                link: 'report/import-inventory',
                key: 'reportImportInven'
            },
            {
                title: 'menu.reportExportOrder',
                icon: <IC_REPORT_EXPORT />,
                link: 'report/export',
                key: 'reportExportOrder'
            },
            {
                title: 'menu.reportExportRepay',
                icon: <IC_REPORT_EXPORT_REPAY />,
                link: 'report/export-repay',
                key: 'reportExportRepay'
            },
            {
                title: 'menu.reportExportDestroy',
                icon: <IC_REPORT_EXPORT_DESTROY />,
                link: 'report/export-destroy',
                key: 'reportExportDestroy'
            },
            {
                title: 'import_payment',
                icon: <IC_REPORT_IMPORT_PAYMENT />,
                link: 'report/import-payment',
                key: 'reportImportPayment'
            },
            {
                title: 'collecting_sales',
                icon: <IC_REPORT_COLLECT_MONEY />,
                link: 'report/collect-sales',
                key: 'reportCollectSales'
            },
            {
                title: 'collecting_import_repay',
                icon: <IC_REPORT_COLLECT_MONEY />,
                link: 'report/collect-returns',
                key: 'reportCollectReturn'
            },
            {
                title: 'menu.reportInventory',
                icon: <IC_IMPORT_INVENTORY />,
                link: 'report/inventory',
                key: 'reportInventory'
            },
            {
                title: 'menu.reportTransactionStatement',
                icon: <IC_REPORT_TRANSACTION />,
                link: 'report/transaction-statement',
                key: 'reportTransactionStatement'
            }
        ],
    },
    {
        title: 'menu.config',
        icon: <IC_CONFIG />,
        link: 'config/unit',
        key: 'config',
        children: [
            {
                title: 'menu.configUnit',
                icon: <IC_UNIT />,
                link: 'config/unit',
                key: 'configUnit'
            },
            {
                title: 'menu.configUnitRate',
                icon: <IC_UNIT_RATE />,
                link: 'config/unit-rate',
                key: 'configUnitRate'
            },
            {
                title: 'menu.configStoreLimit',
                icon: <IC_STORE_LIMIT />,
                link: 'config/store-limit',
                key: 'configStoreLimit'
            },
            {
                title: 'menu.configPrice',
                icon: <IC_PRICE />,
                link: 'config/price',
                key: 'configPrice'
            },
            {
                title: 'menu.configWarn',
                icon: <IC_WARN_TIME />,
                link: 'config/warn-time',
                key: 'configWarn'
            },
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
    let key = window.location.pathname.split('/');

    keyActive = keyActive.length === 2 ? 'dashboard' : keyActive[2]

    let activeLink = (key.length === 4) ? (key[2] + '/' + key[3]) : key[2];

    const [itemActive, setItemActive] = useState(menu[keyActive])

    const [anchorEl, setAnchorEl] = useState(null)

    useEffect(() => {
        glb_sv.commonEvent.subscribe((msg) => {
            if (msg.msgTp === glb_sv.setExpand) {
                // setExpand(msg.data)
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

    return (
        <div
            className={['d-flex', style.iconExpand].join(' ')} style={{ width: '100px' }}
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
                                    className={keyActive === item.key ? 'active' : ' ' + " text-decoration-none text-dark"}
                                >
                                    <Tooltip arrow interactive leaveDelay={100000} key={item.key} className='menu-item' placement='right' title={
                                        item.children.length > 0 ? (<List component="nav" aria-label="main mailbox folders" style={{ padding: 0 }}>
                                            {item?.children?.map((row, index) => (
                                                <React.Fragment key={index}>
                                                    {console.log('rows link: ', row.link)}
                                                    <Link to={baseLink + row.link} key={row.link + index} className="text-decoration-none text-light" >
                                                        <ListItem style={{ padding: '5px 12px', margin: '4px auto' }} button className={activeLink === row.link ? 'sub-active submenu-link' : 'submenu-link'}>
                                                            <ListItemIcon className={style.icon}>{row.icon}</ListItemIcon>
                                                            <ListItemText><span className={style.title}>{t(row.title)}</span></ListItemText>
                                                        </ListItem>
                                                    </Link>
                                                </React.Fragment>
                                            ))}
                                        </List>) : ''
                                    }>
                                        <div className={style.navbar__item}
                                            key={item.key}
                                            onClick={(e) => {
                                                changeMenu(item)
                                            }}
                                        >
                                            <b></b>
                                            <b></b>
                                            <div className={keyActive === item.key ? style.active : ''}>
                                                <div>{item.icon}</div>
                                                <div className={style.navbar_item_text}>{t(item.title)}</div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </Link>
                            </React.Fragment>
                        )
                    })}
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
        </div>
    )
}

export default MenuView
