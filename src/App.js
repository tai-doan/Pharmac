import React, { Suspense, lazy } from 'react'
import * as CryptoJS from 'crypto-js'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import socket_sv from './utils/service/socket_service'
import glb_sv from './utils/service/global_service'

import LoadingView from './components/Loading/View'

const Pages = lazy(() => import('./views/Pages'))

const Login = lazy(() => import('./views/Login'))
const Regist = lazy(() => import('./views/Regist'))
const ForgotPass = lazy(() => import('./views/ForgotPass'))
const Home = lazy(() => import('./views/Home'))

const App = () => {
    // -- check mobile or not
    if (window.navigator.userAgent.toLowerCase().indexOf('android') > -1) {
        glb_sv.isMobile = true
        glb_sv.mobileTp = 'ANDROID'
    } else if (
        window.navigator.userAgent.toLowerCase().indexOf('iphone') > -1 ||
        window.navigator.userAgent.toLowerCase().indexOf('ipad') > -1
    ) {
        glb_sv.mobileTp = 'IOS'
        glb_sv.isMobile = true
    }
    // -- check authentication
    const auInfo = sessionStorage.getItem('0101X10')
    if (auInfo != null && auInfo !== undefined && auInfo.trim() !== '') {
        const bytes = CryptoJS.AES.decrypt(auInfo, glb_sv.configInfo['0101X10'])
        // Convert to original string
        const msgDcode = bytes.toString(CryptoJS.enc.Utf8)
        let objAuthen
        try {
            objAuthen = JSON.parse(msgDcode)
        } catch (error) {
            objAuthen = null
        }
        if (objAuthen && objAuthen['auFlag']) {
            glb_sv.authFlag = true
            glb_sv.userId = objAuthen['userId']
            glb_sv.pharId = objAuthen['pharId']
            glb_sv.pharNm = objAuthen['pharNm']
            glb_sv.userNm = objAuthen['userNm']
            glb_sv.userEmail = objAuthen['userEmail']
            glb_sv.pharAddr = objAuthen['address']
            glb_sv.pharTele = objAuthen['pharTele']
            glb_sv.userLev = objAuthen['userLev']
            glb_sv.pharNm = objAuthen['pharNm']
            glb_sv.userSt = objAuthen['userSt']
            glb_sv.branchId = objAuthen['branchId']
            glb_sv.branch_nm = objAuthen['branch_nm']
            glb_sv.branch_add = objAuthen['branch_add']
            glb_sv.branch_phone = objAuthen['branch_phone']
            glb_sv.logo_nm = objAuthen['logo_nm']
        }
    } else {
        glb_sv.authFlag = false
    }
    //-- khởi tạo kết nối tới server
    socket_sv.setNewConnection()

    return (
        <>
            <Router>
                <Suspense fallback={<LoadingView />}>
                    <Route exact path="/" component={Home} />
                    <Route path="/login" component={Login} />
                    <Route path="/regist" component={Regist} />
                    <Route path="/forgot-pass" component={ForgotPass} />
                    <Route path="/page" component={Pages} />
                </Suspense>
            </Router>

            <div id="snackbar"></div>
        </>
    )
}

export default App
