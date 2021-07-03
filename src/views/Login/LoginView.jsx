import React, { lazy } from 'react'
import T from 'prop-types'
import style from './Login.module.css'
import { Button, Form, Container, Row, Col } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

const Bgview = lazy(() => import('../../components/Bg/View'))

const LoginView = ({
    userName,
    stateErrorUserName, // default: true (normal), false (wrong)
    helperTextUserName,
    changeUserName,

    userPass,
    stateErrorPass,
    helperTextUserPass,
    changeUserPass,

    showPass,
    handleShowPass,

    loginFunct,
    processing,
    handleUserRef,
    handlePassRef,

    rememUserNm,
    handleCheckRem,
}) => {
    const { t } = useTranslation()

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    return (
        <>
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

                                    <Form onSubmit={loginFunct} className="formSubmit" noValidate>
                                        <TextField
                                            className="w-100 mb-3"
                                            // inputRef={el => {
                                            //     setTimeout(() => {
                                            //         if (el && !flagChange) {
                                            //             el.focus()
                                            //         }
                                            //     }, 500)
                                            // }}
                                            inputRef={handleUserRef}
                                            type="text"
                                            label={t('login.userName')}
                                            onChange={changeUserName}
                                            autoComplete="off"
                                            value={userName}
                                            variant="outlined"
                                            size="small"
                                            error={stateErrorUserName}
                                            helperText={helperTextUserName}
                                        />

                                        <TextField
                                            className={'w-100 mb-1'}
                                            type={showPass ? 'text' : 'password'}
                                            label={t('login.password')}
                                            onChange={changeUserPass}
                                            autoComplete="off"
                                            value={userPass}
                                            variant="outlined"
                                            size="small"
                                            inputRef={handlePassRef}
                                            error={stateErrorPass}
                                            helperText={helperTextUserPass}
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
                                                        checked={rememUserNm}
                                                        onChange={handleCheckRem}
                                                        name="rememCheck"
                                                        color="primary"
                                                    />
                                                }
                                                label={t('login.remmemberme')}
                                            />
                                        </FormGroup>
                                        <div className="text-center mt-3">
                                            <Button type="submit" className={['btnSubmit'].join(' ')}>
                                                {processing ? (
                                                    <span>{t('loading')}</span>
                                                ) : (
                                                    <span>{t('btn.login')}</span>
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

LoginView.propTypes = {
    userName: T.string,
    stateErrorUserName: T.bool,
    helperTextUserName: T.string,
    changeUserName: T.func,

    userPass: T.string,
    stateErrorPass: T.bool,
    helperTextUserPass: T.string,
    changeUserPass: T.func,

    showPass: T.bool,
    handleShowPass: T.func,

    loginFunct: T.func,
    processing: T.bool,
    flagChange: T.bool,
    handleUserRef: T.any,
    handlePassRef: T.any,

    rememUserNm: T.bool,
    handleCheckRem: T.func,
}

export default LoginView
