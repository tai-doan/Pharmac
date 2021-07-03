import React from 'react'
import style from './View.module.css'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Bgview = ({ btnText, btnLink }) => {
    const { t } = useTranslation()

    return (
        <>
            <div className={style.container_bgview}>
                <div>
                    <h3 className="text-white font-weight-400">{t('website.title')}</h3>
                    <p className={style.linkFacebook}>
                        <img src={require('../../asset/images/icon-fb.png')} width="39px" alt="" />
                        <a href="https://www.facebook.com/quanlynhathuoccom/" style={{ color: 'white' }} target="blank">
                            {t('website.fanPage')}
                        </a>
                    </p>
                    <p className="text-white">{t('website.download')}</p>
                    <div>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.smartbiz.quanlynhathuoc"
                            target="blank"
                            style={{ marginRight: '15px' }}
                        >
                            <img src={require('../../asset/images/GooglePlay.png')} width="100px" alt="" />
                        </a>
                        <a href="#" rel="noopener">
                            <img src={require('../../asset/images/AppStore.png')} width="100px" alt="" />
                        </a>
                    </div>
                    <Link
                        to={btnLink}
                        className={style.buttonSubmit}
                        style={{ color: 'white', textDecoration: 'none' }}
                    >
                        <button className="mt-3 text-uppercase text-white" id="signUp">
                            {btnText}
                        </button>
                    </Link>

                    <div className="text-center mt-3">
                        <Link to={'/'} className="text-white fz14">
                            {t('website.back')}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Bgview
