import moment from 'moment';
import React, { useState, useEffect, useRef, lazy } from 'react'
import { useTranslation } from 'react-i18next'

import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { Container, Row, Col } from 'reactstrap'
import { FormGroup, FormControlLabel, Checkbox, TextField, InputAdornment, Button } from '@material-ui/core'

import glb_sv from '../../utils/service/global_service'
import control_sv from '../../utils/service/control_services'
import SnackBarService from '../../utils/service/snackbar_service'
import sendRequest from '../../utils/service/sendReq'
import reqFunction from '../../utils/constan/functions';

import style from './Regist.module.css'
const Bgview = lazy(() => import('../../components/Bg/View'))

const serviceInfo = {
    REGISTER: {
        functionName: 'insert',
        reqFunct: reqFunction.REGISTER_PHARMACY,
        biz: 'admin',
        object: 'pharmacy'
    }
}

const RegistLayout = () => {
    const { t } = useTranslation()

    const [pharmacy, setPharmacy] = useState({
        name: '',
        liscence: '',
        licence_dt: '',
        licence_pl: '',
        address: '',
        boss_nm: '',
        boss_phone: '',
        boss_email: '',
        conditionText: 'Đây là phần mềm miễn phí. Chúng tôi không chịu trách nhiệm và có quyền miễn trừ trách nhiệm trong các trường hợp bất khả kháng bao gồm cả các nguyên nhân khách quan và chủ quan như: chiến tranh, hỏa hoạn..., bị virus, hacker tấn công... hoặc sự cố về cơ sở hạ tầng (server, đường truyền,...) cũng như khả năng kinh phí và nhân lực để duy trì sự hoạt động của dịch vụ.',
        calResult: ''
    })
    const [agreeContent, setAgreeContent] = useState('')
    const [agreeCondi, setAgreeCondi] = useState(false)
    const [process, setProcess] = useState(false)

    const step1 = useRef(null)
    const step2 = useRef(null)
    const step3 = useRef(null)
    const step4 = useRef(null)
    const step5 = useRef(null)
    const step6 = useRef(null)
    const step7 = useRef(null)
    const step8 = useRef(null)
    const step9 = useRef(null)
    const step10 = useRef(null)

    const firstNumber = useRef(0)
    const secondNumber = useRef(0)
    const thirdNumber = useRef(0)

    useEffect(() => {
        setAgreeContent(makeRandom())
        if (step1?.current) step1.current.focus()
    }, [])

    const makeRandom = () => {
        firstNumber.current = glb_sv.getRandomArbitrary(5, 10)
        secondNumber.current = glb_sv.getRandomArbitrary(0, 4)
        thirdNumber.current = glb_sv.getRandomArbitrary(1, 8)
        return firstNumber.current + ' - ' + secondNumber.current + ' + ' + thirdNumber.current + ' = '
    }

    const handleChange = e => {
        const newData = { ...pharmacy }
        newData[e.target.name] = e.target.value;
        setPharmacy(newData);
    }

    const handleDateChange = date => {
        const newData = { ...pharmacy };
        newData['licence_dt'] = date;
        setPharmacy(newData)
    }

    const checkValidate = () => {
        if (!!pharmacy.name.trim() && !!pharmacy.liscence.trim() && !!pharmacy.licence_dt && !!pharmacy.licence_pl.trim() && !!pharmacy.address.trim() &&
            !!pharmacy.boss_nm.trim() && !!pharmacy.boss_phone.trim() && !!pharmacy.boss_email.trim() && agreeCondi && Number(pharmacy.calResult) === (firstNumber.current - secondNumber.current + thirdNumber.current)) {
            return false
        }
        return true
    }

    const handleRegister = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [pharmacy.name, pharmacy.liscence, moment(pharmacy.licence_dt).format('DDMMYYYY'), pharmacy.licence_pl, pharmacy.address, pharmacy.boss_nm, pharmacy.boss_phone, pharmacy.boss_email];
        sendRequest(serviceInfo.REGISTER, inputParam, handleResultRegister, true, handleTimeOut)
    }

    const handleResultRegister = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_CODE'] !== 'SYS000') {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // đăng ký thành công
            console.log('message')
            setPharmacy({
                name: '',
                liscence: '',
                licence_dt: '',
                licence_pl: '',
                address: '',
                boss_nm: '',
                boss_phone: '',
                boss_email: '',
                conditionText: 'Đây là phần mềm miễn phí. Chúng tôi không chịu trách nhiệm và có quyền miễn trừ trách nhiệm trong các trường hợp bất khả kháng bao gồm cả các nguyên nhân khách quan và chủ quan như: chiến tranh, hỏa hoạn..., bị virus, hacker tấn công... hoặc sự cố về cơ sở hạ tầng (server, đường truyền,...) cũng như khả năng kinh phí và nhân lực để duy trì sự hoạt động của dịch vụ.',
                calResult: null
            })
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    return (
        <div className={style.register}>
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xs={12} md={6} className="bg-white">
                        <div className={style.box_regist}>
                            <div className="w-100" style={{ margin: '15px 0' }}>
                                <div className="formSubmit registerForm">
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
                                                    onChange={handleChange}
                                                    autoComplete="off"
                                                    value={pharmacy.name}
                                                    variant="outlined"
                                                    size="small"
                                                    name='name'
                                                    // error={stateErrorPharmacyName}
                                                    // helperText={helperTextPharmacyName}
                                                    inputRef={step1}
                                                    onKeyPress={event => {
                                                        if (event.key === 'Enter') {
                                                            step2.current.focus()
                                                        }
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={12} md={6}>
                                                <TextField
                                                    className="w-100 mb-09"
                                                    type="text"
                                                    label={t('regist.licence')}
                                                    onChange={handleChange}
                                                    autoComplete="off"
                                                    value={pharmacy.liscence}
                                                    variant="outlined"
                                                    size="small"
                                                    name='liscence'
                                                    // error={stateErrorLicence}
                                                    // helperText={helperTextLicence}
                                                    inputRef={step2}
                                                    onKeyPress={event => {
                                                        if (event.key === 'Enter') {
                                                            step3.current.focus()
                                                        }
                                                    }}
                                                />
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker
                                                        className="w-100 mb-09"
                                                        label={t('regist.licenceDate')}
                                                        format="dd/MM/yyyy"
                                                        // mm/dd/yyyy: lang = vn
                                                        value={pharmacy.licence_dt === '' ? null : pharmacy.licence_dt}
                                                        onChange={handleDateChange}
                                                        size="small"
                                                        inputVariant="outlined"
                                                        // error={stateErrorLicenceDT}
                                                        // helperText={helperTextLicenceDT}
                                                        inputRef={step3}
                                                        onKeyPress={event => {
                                                            if (event.key === 'Enter') {
                                                                step4.current.focus()
                                                            }
                                                        }}
                                                    />
                                                </MuiPickersUtilsProvider>
                                            </Col>
                                        </Row>
                                        <TextField
                                            className="w-100 mb-09"
                                            type="text"
                                            label={t('regist.licencePlace')}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            value={pharmacy.licence_pl}
                                            variant="outlined"
                                            size="small"
                                            name='licence_pl'
                                            // error={stateErrorLicencePL}
                                            // helperText={helperTextLicencePL}
                                            inputRef={step4}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step5.current.focus()
                                                }
                                            }}
                                        />
                                        <TextField
                                            className="w-100 mb-09"
                                            type="text"
                                            label={t('regist.pharmacyAddress')}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            value={pharmacy.address}
                                            variant="outlined"
                                            size="small"
                                            name='address'
                                            // error={stateErrorAddress}
                                            // helperText={helperTextAddress}
                                            inputRef={step5}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step6.current.focus()
                                                }
                                            }}
                                        />

                                        <TextField
                                            className="w-100 mb-09"
                                            type="text"
                                            label={t('regist.bossName')}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            value={pharmacy.boss_nm}
                                            variant="outlined"
                                            size="small"
                                            name='boss_nm'
                                            // error={stateErrorBossName}
                                            // helperText={helperTextBossName}
                                            inputRef={step6}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step7.current.focus()
                                                }
                                            }}
                                        />

                                        <TextField
                                            className="w-100 mb-09"
                                            type="email"
                                            label={t('regist.email')}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            value={pharmacy.boss_email}
                                            variant="outlined"
                                            size="small"
                                            name='boss_email'
                                            // error={stateErrorBossEmail}
                                            // helperText={helperTextBossEmail}
                                            inputRef={step7}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step8.current.focus()
                                                }
                                            }}
                                        />

                                        <Row className="justify-content-center">
                                            <Col xs={12} md={6}>
                                                <TextField
                                                    className="w-100 mb-09"
                                                    type="text"
                                                    label={t('regist.phone')}
                                                    onChange={handleChange}
                                                    autoComplete="off"
                                                    value={pharmacy.boss_phone}
                                                    variant="outlined"
                                                    size="small"
                                                    name='boss_phone'
                                                    // error={stateErrorBossPhone}
                                                    // helperText={helperTextBossPhone}
                                                    inputRef={step8}
                                                    onKeyPress={event => {
                                                        if (event.key === 'Enter') {
                                                            step9.current.focus()
                                                        }
                                                    }}
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
                                                                {agreeContent}
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    size="small"
                                                    variant="outlined"
                                                    value={pharmacy.calResult}
                                                    name='calResult'
                                                    onChange={handleChange}
                                                    // error={stateErrorCalc}
                                                    // helperText={t(helperTextCalc)}
                                                    inputRef={step9}
                                                    onKeyPress={event => {
                                                        if (event.key === 'Enter') {
                                                            step10.current.focus()
                                                        }
                                                    }}
                                                />
                                            </Col>
                                        </Row>

                                        <TextField
                                            className="w-100 mb-0"
                                            type="text"
                                            disabled={true}
                                            label={t('regist.conditon')}
                                            autoComplete="off"
                                            inputProps={{
                                                style: { fontSize: 11, fontStyle: 'italic', color: '#757208' },
                                            }}
                                            value={pharmacy.conditionText}
                                            rowsMax={2}
                                            variant="outlined"
                                            size="small"
                                            multiline={true}
                                        />
                                        <FormGroup row>
                                            <FormControlLabel inputRef={step10}
                                                control={
                                                    <Checkbox
                                                        checked={agreeCondi}
                                                        onChange={e => setAgreeCondi(e.target.checked)}
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
                                            <Button onClick={() => handleRegister()} disabled={checkValidate()} className={['btnSubmit'].join(' ')}>
                                                {process ? (
                                                    <span>{t('loading')}</span>
                                                ) : (
                                                    <span>{t('btn.regist')}</span>
                                                )}
                                            </Button>
                                        </div>
                                    </Container>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6} className="bgColor">
                        <Bgview btnText={t('btn.login')} btnLink="/login" />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default RegistLayout;
