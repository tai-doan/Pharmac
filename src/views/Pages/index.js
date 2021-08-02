import React, { Suspense, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import style from './Pages.module.css'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'
import LoadingView from '../../components/Loading/View'
import MenuView from '../../components/Menu/index'
import HeaderView from '../../components/Header/index'

import Dashboard from '../Dashboard/index'
import Config from '../Config/index'
import Report from '../Report/index'
import Partner from '../Partner/index'
import Order from '../Order/index'
import Products from '../Products'
import SettlementLayout from '../Settlement'
import AdminManagementLayout from '../AdminManagement'

import glb_sv from '../../utils/service/global_service'

const baseLink = '/page/'

function Child() {
    let { link } = useParams()

    switch (link) {
        case 'dashboard':
            return <Dashboard />
        case 'order':
            return <Order />
        case 'partner':
            return <Partner />
        case 'report':
            return <Report />
        case 'config':
            return <Config />
        case 'products':
            return <Products />
        case 'settlement':
            return <SettlementLayout />
        case 'management':
            return <AdminManagementLayout />
        default:
            break
    }
}

const Page = () => {
    const history = useHistory()

    useEffect(() => {
        if (!glb_sv.authFlag) {
            history.push('/login')
        }
    }, [])

    return (
        <div className={style.app_page}>
            <div className="d-flex w-100">
                <div id='menu_view'>
                    <MenuView baseLink={baseLink} />
                </div>
                <div className={'w-100 ' + style.bgLightCustome} style={{ maxWidth: `calc(100vw - 100px)` }}>
                    <header className="w-100">
                        <HeaderView />
                    </header>
                    <div className="container-fluid">
                        <div className={['p-3 bg-white', style.contentPage].join(' ')}>
                            <Suspense fallback={<LoadingView />}>
                                <Switch>
                                    <Route path="/page/:link" children={<Child />} />
                                    <Redirect to={{ pathname: '/page/dashboard', state: { from: '/' } }} />
                                </Switch>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Page;
