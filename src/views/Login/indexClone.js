import React, { useState, useEffect, useRef, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'
import * as CryptoJS from 'crypto-js'

import { Container, Row, Col } from 'reactstrap'
import { FormGroup, FormControlLabel, Checkbox, TextField, InputAdornment, Button, IconButton } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import glb_sv from '../../utils/service/global_service'
import control_sv from '../../utils/service/control_services'
import SnackBarService from '../../utils/service/snackbar_service'
import sendRequest from '../../utils/service/sendReq'
import reqFunction from '../../utils/constan/functions';
import style from './Login.module.css'

const Bgview = lazy(() => import('../../components/Bg/View'))
const serviceInfo = {
    LOGIN: {
        functionName: 'login',
        reqFunct: reqFunction.LOGIN,
        biz: 'admin',
        object: 'users'
    }
}
const LoginLayout = () => {
    const { t } = useTranslation()
    const { history } = useHistory()

    const [showPass, setShowPass] = useState(false)
    const [recommend, setRecommend] = useState(true)
    const [process, setProcess] = useState(false)
    const [user, setUser] = useState({
        username: '',
        password: ''
    })

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)

    useEffect(() => {
        const userNm = localStorage.getItem('userNm')
        if (usernameRef?.current) usernameRef.current.focus()
        if (userNm) {
            setTimeout(() => {
                setUser(prev => { return { ...prev, username: userNm } })
                setRecommend(true)
                sessionStorage.setItem('tempUserName', userNm)
            }, 100)
        } else {
            setTimeout(() => {
                setRecommend(false)
                sessionStorage.setItem('tempUserName', '')
            }, 100)
        }
    }, [])

    const handleChange = e => {
        const newUser = { ...user }
        newUser[e.target.name] = e.target.value;
        setUser(newUser)
    }

    const handleRecommendChange = e => {
        setRecommend(e.target.checked)
    }

    const handleShowPass = () => {
        setShowPass(!showPass)
    }

    const handleMouseDownPassword = e => {
        e.preventDefault()
    }

    const handleLogin = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [user.username, user.password];
        sendRequest(serviceInfo.LOGIN, inputParam, handleResultLogin, true, handleTimeOut)
    }

    const handleResultLogin = (reqInfoMap, message) => {
        console.log('handleResultLogin: ', reqInfoMap, message)
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // đăng ký thành công
            console.log('login success: ', message)
            glb_sv.authFlag = true
            glb_sv.userId = message['PROC_DATA'][0].o_6 || user.username.trim()
            glb_sv.pharId = message['PROC_DATA'][0].o_1
            glb_sv.branchId = message['PROC_DATA'][0].o_3
            glb_sv.pharNm = message['PROC_DATA'][0].o_2
            glb_sv.pharAddr = ''
            glb_sv.branch_nm = message['PROC_DATA'][0].o_4
            glb_sv.branch_add = ''
            glb_sv.branch_phone = ''
            glb_sv.logo_nm = ''
            glb_sv.userEmail = message['PROC_DATA'][0].o_8
            glb_sv.pharTele = message['PROC_DATA'][0].o_9
            glb_sv.userNm = message['PROC_DATA'][0].o_5
            glb_sv.userLev = message['PROC_DATA'][0].o_7
            glb_sv.userSt = ''

            const objAuthen = {
                userId: glb_sv.userId,
                pharId: glb_sv.pharId,
                branchId: glb_sv.branchId,
                branch_nm: glb_sv.branch_nm,
                branch_add: glb_sv.branch_add,
                branch_phone: glb_sv.branch_phone,
                logo_nm: glb_sv.logo_nm,
                pharNm: glb_sv.pharNm,
                userEmail: glb_sv.userEmail,
                userNm: glb_sv.userNm,
                userLev: glb_sv.userLev,
                userSt: glb_sv.userSt,
                address: glb_sv.pharAddr,
                pharTele: glb_sv.pharTele,
                auFlag: true,
            }
            const msgss = CryptoJS.AES.encrypt(JSON.stringify(objAuthen), glb_sv.configInfo['0101X10']).toString()
            const secrInfo = CryptoJS.AES.encrypt(message['PROC_DATA'][0]['tk'], glb_sv.configInfo['0101X10']).toString()
            sessionStorage.setItem('0101X10', msgss)
            sessionStorage.setItem('0101X11', secrInfo)
            if (recommend) {
                localStorage.setItem('userNm', user.username)
            } else {
                localStorage.removeItem('userNm')
            }
            history.push('/page/dashboard')
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const checkValidate = () => {
        if (!!user.username.trim() && !!user.password.trim()) {
            return false
        }
        return true
    }

    return (
        <div className={style.login}>
            <Container fluid>
                <Row className="justify-content-center ">
                    <Col xs={12} md={6} className="bgColor">
                        <Bgview btnText={t('btn.regist')} btnLink="/regist" />
                    </Col>
                    <Col xs={12} md={6} className="bg-white">
                        <div className="boxContainer">
                            <div className="w-75 m-auto">
                                <div className="text-center mb-3">
                                    <img src={require('../../asset/images/logo.png')} width="100px" alt="Logo" />
                                </div>

                                <div className="formSubmit" noValidate>
                                    <TextField
                                        className="w-100 mb-3"
                                        inputRef={usernameRef}
                                        type="text"
                                        label={t('login.userName')}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        value={user.username}
                                        name='username'
                                        variant="outlined"
                                        size="small"
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                passwordRef.current.focus()
                                            }
                                        }}
                                    // error={stateErrorUserName}
                                    // helperText={helperTextUserName}
                                    />

                                    <TextField
                                        className={'w-100 mb-1'}
                                        type={showPass ? 'text' : 'password'}
                                        label={t('login.password')}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        value={user.password}
                                        variant="outlined"
                                        size="small"
                                        name='password'
                                        inputRef={passwordRef}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleLogin()
                                            }
                                        }}
                                        // error={stateErrorPass}
                                        // helperText={helperTextUserPass}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleShowPass}
                                                        onMouseDown={handleMouseDownPassword}
                                                    >
                                                        {showPass ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <FormGroup row>
                                        <Link to="/forgot-pass" className="d-block text-right w-100 fz13">
                                            {t('login.forgotPass')}
                                        </Link>
                                    </FormGroup>
                                    <FormGroup row className="fz14">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={recommend}
                                                    onChange={handleRecommendChange}
                                                    name="rememCheck"
                                                    color="primary"
                                                />
                                            }
                                            label={t('login.remmemberme')}
                                        />
                                    </FormGroup>
                                    <div className="text-center mt-3">
                                        <Button onClick={handleLogin} disabled={checkValidate()} className={['btnSubmit'].join(' ')}>
                                            {process ? (
                                                <span>{t('loading')}</span>
                                            ) : (
                                                <span>{t('btn.login')}</span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default LoginLayout;
