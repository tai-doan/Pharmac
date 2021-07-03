import 'date-fns'

import React, { lazy } from 'react'
import style from './Regist.module.css'
import { Button, Form, Container, Row, Col } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import T from 'prop-types'

import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
const Bgview = lazy(() => import('../../components/Bg/View'))

const RegistView = ({
    phar_nm,
    stateErrorPharmacyName, // default: true (normal), false (wrong)
    helperTextPharmacyName,
    changePharmacyName,

    licence,
    stateErrorLicence, // default: true (normal), false (wrong)
    helperTextLicence,
    changeLicence,

    licence_dt = new Date(''),
    stateErrorLicenceDT, // default: true (normal), false (wrong)
    helperTextLicenceDT,
    changeLicenceDate,

    licence_pl,
    stateErrorLicencePL, // default: true (normal), false (wrong)
    helperTextLicencePL,
    changeLicencePlace,

    address,
    stateErrorAddress, // default: true (normal), false (wrong)
    helperTextAddress,
    changeAddress,

    boss_nm,
    stateErrorBossName, // default: true (normal), false (wrong)
    helperTextBossName,
    changeBossName,

    boss_phone,
    stateErrorBossPhone, // default: true (normal), false (wrong)
    helperTextBossPhone,
    changeBossPhone,

    boss_email,
    stateErrorBossEmail, // default: true (normal), false (wrong)
    helperTextBossEmail,
    changeBossEmail,

    boss_address,
    stateErrorBossAddress, // default: true (normal), false (wrong)
    helperTextBossAddress,
    changeBossAddress,

    registFunct,
    processing,
    conditionText,
    argeeCond,
    handleCheckCond,

    calContent,
    stateErrorCalc, // default: true (normal), false (wrong)
    helperTextCalc,
    calResult,
    changeCalResult,

    handlePharNmRef,
    handleLicenceRef,
    handleLicenceDtRef,
    handleLicencePlRef,
    handlePharAddrRef,
    handleBossNmRef,
    handleBossPhoneRef,
    handleBossEmailRef,
    handleBossAddrRef,
    handleCalcRef,
}) => {
    const { t } = useTranslation()

    return (
        <>
            <div className={style.register}>
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col xs={12} md={6} className="bg-white">
                            <div className={style.box_regist}>
                                <div className="w-100" style={{ margin: '15px 0' }}>
                                    <Form onSubmit={registFunct} className="formSubmit registerForm">
                                        <Container className="w-100">
                                            <Row>
                                                <Col>
                                                    <h6 className="font-weight-bold text-left mb-09">
                                                        {t('regist.title')}
                                                    </h6>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <TextField
                                                        className="w-100 mb-09"
                                                        autoFocus={true}
                                                        type="text"
                                                        label={t('regist.pharmacyName')}
                                                        onChange={changePharmacyName}
                                                        autoComplete="off"
                                                        value={phar_nm}
                                                        variant="outlined"
                                                        size="small"
                                                        error={stateErrorPharmacyName}
                                                        helperText={helperTextPharmacyName}
                                                        inputRef={handlePharNmRef}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={12} md={6}>
                                                    <TextField
                                                        className="w-100 mb-09"
                                                        type="text"
                                                        label={t('regist.licence')}
                                                        onChange={changeLicence}
                                                        autoComplete="off"
                                                        value={licence}
                                                        variant="outlined"
                                                        size="small"
                                                        error={stateErrorLicence}
                                                        helperText={helperTextLicence}
                                                        inputRef={handleLicenceRef}
                                                    />
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            className="w-100 mb-09"
                                                            label={t('regist.licenceDate')}
                                                            format="MM/dd/yyyy"
                                                            // mm/dd/yyyy: lang = vn
                                                            value={licence_dt === '' ? null : licence_dt}
                                                            onChange={changeLicenceDate}
                                                            size="small"
                                                            inputVariant="outlined"
                                                            error={stateErrorLicenceDT}
                                                            helperText={helperTextLicenceDT}
                                                            inputRef={handleLicenceDtRef}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Col>
                                            </Row>
                                            <TextField
                                                className="w-100 mb-09"
                                                type="text"
                                                label={t('regist.licencePlace')}
                                                onChange={changeLicencePlace}
                                                autoComplete="off"
                                                value={licence_pl}
                                                variant="outlined"
                                                size="small"
                                                error={stateErrorLicencePL}
                                                helperText={helperTextLicencePL}
                                                inputRef={handleLicencePlRef}
                                            />
                                            <TextField
                                                className="w-100 mb-09"
                                                type="text"
                                                label={t('regist.pharmacyAddress')}
                                                onChange={changeAddress}
                                                autoComplete="off"
                                                value={address}
                                                variant="outlined"
                                                size="small"
                                                error={stateErrorAddress}
                                                helperText={helperTextAddress}
                                                inputRef={handlePharAddrRef}
                                            />

                                            <TextField
                                                className="w-100 mb-09"
                                                type="text"
                                                label={t('regist.bossName')}
                                                onChange={changeBossName}
                                                autoComplete="off"
                                                value={boss_nm}
                                                variant="outlined"
                                                size="small"
                                                error={stateErrorBossName}
                                                helperText={helperTextBossName}
                                                inputRef={handleBossNmRef}
                                            />

                                            <TextField
                                                className="w-100 mb-09"
                                                type="email"
                                                label={t('regist.email')}
                                                onChange={changeBossEmail}
                                                autoComplete="off"
                                                value={boss_email}
                                                variant="outlined"
                                                size="small"
                                                error={stateErrorBossEmail}
                                                helperText={helperTextBossEmail}
                                                inputRef={handleBossEmailRef}
                                            />

                                            <Row className="justify-content-center">
                                                <Col xs={12} md={6}>
                                                    <TextField
                                                        className="w-100 mb-09"
                                                        type="text"
                                                        label={t('regist.phone')}
                                                        onChange={changeBossPhone}
                                                        autoComplete="off"
                                                        value={boss_phone}
                                                        variant="outlined"
                                                        size="small"
                                                        error={stateErrorBossPhone}
                                                        helperText={helperTextBossPhone}
                                                        inputRef={handleBossPhoneRef}
                                                    />
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <TextField
                                                        className="w-100 mb-09"
                                                        type="text"
                                                        label={t('regist.calculator')}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    {calContent}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        size="small"
                                                        variant="outlined"
                                                        value={calResult}
                                                        onChange={changeCalResult}
                                                        error={stateErrorCalc}
                                                        helperText={t(helperTextCalc)}
                                                        inputRef={handleCalcRef}
                                                    />
                                                </Col>
                                            </Row>

                                            {/* <TextField
                                                className="w-100 mb-09"
                                                type="text"
                                                label={t('regist.address')}
                                                onChange={changeBossAddress}
                                                autoComplete="off"
                                                value={boss_address}
                                                variant="outlined"
                                                size="small"
                                                error={stateErrorBossAddress}
                                                helperText={t(helperTextBossAddress)}
                                                inputRef={handleBossAddrRef}
                                            /> */}

                                            <TextField
                                                className="w-100 mb-0"
                                                type="text"
                                                disabled={true}
                                                label={t('regist.conditon')}
                                                autoComplete="off"
                                                inputProps={{
                                                    style: { fontSize: 11, fontStyle: 'italic', color: '#757208' },
                                                }}
                                                value={conditionText}
                                                rowsMax={2}
                                                variant="outlined"
                                                size="small"
                                                multiline={true}
                                            />
                                            <FormGroup row>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={argeeCond}
                                                            onChange={handleCheckCond}
                                                            name="conditionCheck"
                                                            color="secondary"
                                                            inputProps={{
                                                                style: { fontSize: 12 },
                                                            }}
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <span className={style.checkBoxLabel}>
                                                            {t('regist.agreeCond')}
                                                        </span>
                                                    }
                                                />
                                            </FormGroup>

                                            <div className="text-center mb-09">
                                                <Button type="submit" className={['btnSubmit'].join(' ')}>
                                                    {processing ? (
                                                        <span>{t('loading')}</span>
                                                    ) : (
                                                        <span>{t('btn.regist')}</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </Container>
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

RegistView.propTypes = {
    phar_nm: T.string,
    stateErrorPharmacyName: T.bool, // default: true (normal), false (wrong)
    helperTextPharmacyName: T.string,
    changePharmacyName: T.func,

    licence: T.string,
    stateErrorLicence: T.bool, // default: true (normal), false (wrong)
    helperTextLicence: T.string,
    changeLicence: T.func,

    licence_dt: T.any,
    stateErrorLicenceDT: T.bool, // default: true (normal), false (wrong)
    helperTextLicenceDT: T.string,
    changeLicenceDate: T.func,

    licence_pl: T.string,
    stateErrorLicencePL: T.bool, // default: true (normal), false (wrong)
    helperTextLicencePL: T.string,
    changeLicencePlace: T.func,

    address: T.string,
    stateErrorAddress: T.bool, // default: true (normal), false (wrong)
    helperTextAddress: T.string,
    changeAddress: T.func,

    boss_nm: T.string,
    stateErrorBossName: T.bool, // default: true (normal), false (wrong)
    helperTextBossName: T.string,
    changeBossName: T.func,

    boss_phone: T.string,
    stateErrorBossPhone: T.bool, // default: true (normal), false (wrong)
    helperTextBossPhone: T.string,
    changeBossPhone: T.func,

    boss_email: T.string,
    stateErrorBossEmail: T.bool, // default: true (normal), false (wrong)
    helperTextBossEmail: T.string,
    changeBossEmail: T.func,

    boss_address: T.string,
    stateErrorBossAddress: T.bool, // default: true (normal), false (wrong)
    helperTextBossAddress: T.string,
    changeBossAddress: T.func,

    registFunct: T.func,
    processing: T.bool,
    conditionText: T.string,

    argeeCond: T.bool,
    handleCheckCond: T.func,

    calContent: T.string,
    stateErrorCalc: T.bool, // default: true (normal), false (wrong)
    helperTextCalc: T.string,
    calResult: T.string,
    changeCalResult: T.func,

    handlePharNmRef: T.any,
    handleLicenceRef: T.any,
    handleLicenceDtRef: T.any,
    handleLicencePlRef: T.any,
    handlePharAddrRef: T.any,
    handleBossNmRef: T.any,
    handleBossPhoneRef: T.any,
    handleBossEmailRef: T.any,
    handleBossAddrRef: T.any,
    handleCalcRef: T.any,
}
export default RegistView
