import React from 'react'
import style from './Home.module.css'
import { Container, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
// import about from '../../asset/about/data.json'

const HomeView = () => {
    const { t } = useTranslation()
    return (
        <>
            <div className={style.home_hello}>
                <div className={style.container_main}>
                    <Container fluid>
                        <div className="row align-items-center justify-content-center">
                            <Col xs={12} md={6}>
                                <div className={style.container_home}>
                                    <div className=" text-white">
                                        <img
                                            className="rounded-circle"
                                            src={require('../../asset/images/logo.png')}
                                            width="100px"
                                            alt="Logo"
                                            title="Logo"
                                        />
                                        <h5 className="mt-3">{t('website.welcome')}</h5>
                                        <h1 className="mt-3 text-white font-weight-bold">{t('website.title')}</h1>
                                        <div>
                                            <Link
                                                className="mr-3"
                                                to="/login"
                                                style={{ color: 'white', textDecoration: 'none' }}
                                            >
                                                <button
                                                    className={[
                                                        style.bg_pink,
                                                        style.buttonSubmit,
                                                        style.buttonSignUp,
                                                    ].join(' ')}
                                                    id="signUp"
                                                >
                                                    {t('btn.login')}
                                                </button>
                                            </Link>
                                            <Link to="/regist" style={{ color: 'white', textDecoration: 'none' }}>
                                                <button
                                                    className={[style.buttonSubmit, style.buttonSignUp].join(' ')}
                                                    id="signUp"
                                                >
                                                    {t('btn.regist')}
                                                </button>
                                            </Link>
                                        </div>
                                        <div className="mt-3">
                                            <p className="fz14 mb-2 text-center text-white">{t('website.download')}</p>
                                            <a
                                                className="mr-2"
                                                href="https://play.google.com/store/apps/details?id=com.smartbiz.quanlynhathuoc"
                                                target="blank"
                                            >
                                                <img
                                                    src={require('../../asset/images/GooglePlay.png')}
                                                    width="100px"
                                                    alt=""
                                                />
                                            </a>
                                            <a href="#" rel="noopener">
                                                <img
                                                    src={require('../../asset/images/AppStore.png')}
                                                    width="100px"
                                                    alt=""
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} md={6} className="text-center">
                                <img src={require('../../asset/images/bg-home-1.png')} className="w-100" alt="" />
                            </Col>
                        </div>
                    </Container>
                </div>
            </div>

            {/* {about.map((item, index) => {
                if (index % 2 === 0) {
                    return (
                        <div className={[style.about, style.bg_right].join(' ')} key={item.title}>
                            <div className={style.container_main}>
                                <Container fluid>
                                    <div className="row align-items-center">
                                        <Col xs={12} md={5}>
                                            <img src={item.image} alt="" className="w-100" />
                                        </Col>
                                        <Col xs={12} md={7}>
                                            <h2 className="font-weight-bold text-center">{item.title}</h2>
                                            <h2 className="font-weight-bold text-center">{item.subTitle}</h2>
                                            <p className="fz14">{item.description}</p>
                                        </Col>
                                    </div>
                                </Container>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className={[style.about, style.bg_left].join(' ')} key={item.title}>
                            <div className={style.container_main}>
                                <Container fluid>
                                    <div className="row align-items-center">
                                        <Col xs={12} md={7}>
                                            <h2 className="font-weight-bold text-center">{item.title}</h2>
                                            <h2 className="font-weight-bold text-center">{item.subTitle}</h2>
                                            <p className="fz14">{item.description}</p>
                                        </Col>
                                        <Col xs={12} md={5}>
                                            <img src={item.image} alt="" className="w-100" />
                                        </Col>
                                    </div>
                                </Container>
                            </div>
                        </div>
                    )
                }
            })} */}
        </>
    )
}

export default HomeView
