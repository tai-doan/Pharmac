import React, { lazy } from 'react'
import style from './ForgotPass.module.css'
// import { Link } from 'react-router-dom'
import { Button, Form, Container, Row, Col } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import T from 'prop-types'
import TextField from '@material-ui/core/TextField'

const Bgview = lazy(() => import('../../components/Bg/View'))

const ForgotPassView = ({
    userName,
    stateErrorUserName, // default: true (normal), false (wrong)
    helperTextUserName,
    changeUserName,

    email,
    stateErrorEmail, // default: true (normal), false (wrong)
    helperTextEmail,
    changeEmail,

    forgotPassFunct,
    processing,

    handleUserNameRef,
    handleEmailRef,
}) => {
    const { t } = useTranslation()

    return (
        <>
            <div className={style.regist}>
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col xs={12} md={6} className="bg-white">
                            <div className="boxContainer">
                                <div className="w-75 m-auto">
                                    <Form onSubmit={forgotPassFunct} className="formSubmit">
                                        <img src={require('../../asset/images/forgot_pass.png')} width="100px" alt="" />
                                        <h6 className="font-weight-bold text-left mb-3">{t('login.forgotPass')}</h6>
                                        <TextField
                                            className="w-100 mb-3"
                                            type="text"
                                            label={t('forgotPass.userName')}
                                            onChange={changeUserName}
                                            autoComplete="off"
                                            value={userName}
                                            // inputRef={el => {
                                            //     setTimeout(() => {
                                            //         if (el && flagChange === 0 && userName === '') {
                                            //             el.focus()
                                            //         }
                                            //     }, 500)
                                            // }}
                                            inputRef={handleUserNameRef}
                                            variant="outlined"
                                            size="small"
                                            error={stateErrorUserName}
                                            helperText={helperTextUserName}
                                        />
                                        <TextField
                                            className="w-100 mb-3"
                                            // inputRef={el => {
                                            //     setTimeout(() => {
                                            //         if (el && flagChange === 1) {
                                            //             el.focus()
                                            //         }
                                            //     }, 500)
                                            // }}
                                            inputRef={handleEmailRef}
                                            type="email"
                                            label={t('forgotPass.email')}
                                            onChange={changeEmail}
                                            autoComplete="off"
                                            value={email}
                                            variant="outlined"
                                            size="small"
                                            error={stateErrorEmail}
                                            helperText={helperTextEmail}
                                        />
                                        {/* <Link to="/login" className="d-block text-left fz13">
                                            {t('login.backLogin')}
                                        </Link> */}
                                        <div className="text-center mt-3">
                                            <Button type="submit" className={['btnSubmit'].join(' ')}>
                                                {processing ? (
                                                    <span>{t('loading')}</span>
                                                ) : (
                                                    <span>{t('forgotPass.btn')}</span>
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6} className="bgColor">
                            <Bgview btnText={t('btn.login')} btnLink="/login" />
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

ForgotPassView.propTypes = {
    userName: T.string,
    stateErrorUserName: T.bool,
    helperTextUserName: T.string,
    changeUserName: T.func,

    email: T.string,
    stateErrorEmail: T.bool,
    helperTextEmail: T.string,
    changeEmail: T.func,

    forgotPassFunct: T.func,
    processing: T.bool,
    flagChange: T.number,

    handleUserNameRef: T.any,
    handleEmailRef: T.any,
}
export default ForgotPassView
