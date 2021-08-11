import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card, CardHeader, CardContent, Grid, TextField, Backdrop, makeStyles, CircularProgress, Button, CardActions, Divider, Avatar, Badge, withStyles, Dialog
} from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers'
import moment from 'moment'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

import LoopIcon from '@material-ui/icons/Loop'
import { ReactComponent as IC_CAMERA } from '../../../asset/images/camera.svg'

const serviceInfo = {
    UPDATE: {
        functionName: 'update',
        reqFunct: reqFunction.PHARMACY_UPDATE,
        biz: 'admin',
        object: 'pharmacy'
    },
    GET_PHARMACY_BY_ID: {
        functionName: 'get_by_id',
        reqFunct: reqFunction.PHARMACY_BY_ID,
        biz: 'admin',
        object: 'pharmacy'
    },
    UPDATE_LOGO: {
        functionName: 'update_logo',
        reqFunct: reqFunction.UPDATE_LOGO,
        biz: 'admin',
        object: 'pharmacy'
    }
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    button: {
        margin: 10
    },
    input: {
        display: 'none'
    },
    large: {
        width: theme.spacing(15),
        height: theme.spacing(15),
    }
}))

const SmallAvatar = withStyles((theme) => ({
    root: {
        width: 30,
        height: 30,
        border: `2px solid ${theme.palette.background.paper}`,
    },
}))(Avatar);

const PharmacyList = () => {
    const { t } = useTranslation()
    const classes = useStyles()
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const [process, setProcess] = useState(false)
    const [pharmacyInfo, setPharmacyInfo] = useState({
        o_1: '',
        o_2: '',
        o_3: null,
        o_4: '',
        o_5: '',
        o_6: '',
        o_7: '',
        o_8: ''
    })

    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const step5Ref = useRef(null)
    const step6Ref = useRef(null)
    const step7Ref = useRef(null)
    const step8Ref = useRef(null)
    const [modalPreviewImage, setModalPreviewImage] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const logoInfo = useRef({
        file: null,
        name: '',
        type: '',
        size: 0
    })

    useEffect(() => {
        handleRefresh()
    }, [])

    const handleResultGetPharmarcyByID = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let data = newData.rows[0]
            data.o_7 = moment(data.o_7, 'YYYYMMDD').toString()
            setPharmacyInfo(data)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleChange = e => {
        const newPharmacy = { ...pharmacyInfo }
        newPharmacy[e.target.name] = e.target.value
        setPharmacyInfo(newPharmacy)
    }

    const handleDateChange = date => {
        const newPharmacy = { ...pharmacyInfo };
        newPharmacy['o_7'] = date;
        setPharmacyInfo(newPharmacy)
    }

    const checkValidate = () => {
        if (!!pharmacyInfo?.o_1 && !!pharmacyInfo?.o_2.trim() && !!pharmacyInfo?.o_5.trim() && !!pharmacyInfo?.o_6.trim() && !!pharmacyInfo?.o_7 &&
            !!pharmacyInfo?.o_8.trim() && !!pharmacyInfo.o_9.trim() && !!pharmacyInfo.o_10.trim() && !!pharmacyInfo.o_11.trim()) {
            return false
        }
        return true
    }

    const handleUpdate = () => {
        if (checkValidate()) return
        setProcess(true)
        const inputParam = [
            pharmacyInfo.o_2,
            pharmacyInfo.o_6,
            moment(pharmacyInfo.o_7).format('YYYYMMDD'),
            pharmacyInfo.o_8,
            pharmacyInfo.o_5,
            pharmacyInfo.o_9,
            pharmacyInfo.o_10,
            pharmacyInfo.o_11
        ];
        setControlTimeOutKey(serviceInfo.UPDATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.UPDATE, inputParam, handleResultUpdate, true, handleTimeOut)
    }

    const handleResultUpdate = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setPharmacyInfo({})
            sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [glb_sv.pharId], handleResultGetPharmarcyByID, true, handleTimeOut)
        }
    }

    const handleRefresh = () => {
        sendRequest(serviceInfo.GET_PHARMACY_BY_ID, [glb_sv.pharId], handleResultGetPharmarcyByID, true, handleTimeOut)
    }

    const handleUploadClick = event => {
        if (event.target.files.length) {
            let fileUpload = event.target.files[0]
            if (fileUpload?.type.substr(6) !== 'jpeg' && fileUpload?.type.substr(6) !== 'png') {
                SnackBarService.alert(t('message.type_image_wrong'), true, 4, 3000)
                return
            }
            if (fileUpload?.size > 5242880) {
                SnackBarService.alert(t('message.image_long_size'), true, 4, 3000)
                return
            }
            const reader = new FileReader()
            const reader2 = new FileReader()

            reader.readAsDataURL(fileUpload)
            reader2.readAsBinaryString(fileUpload)

            reader.onloadend = e => {
                setPreviewImage(e.target.result)
                setModalPreviewImage(true)
            }

            reader2.onloadend = e => {
                logoInfo.current.file = e.target.result
                logoInfo.current.name = fileUpload?.name
                logoInfo.current.type = fileUpload?.type.substr(6)
                logoInfo.current.size = fileUpload?.size
            }
        }
    }

    const uploadFileToServer = () => {
        if (!logoInfo?.current || !logoInfo?.current.type || !logoInfo?.current.size || !logoInfo?.current.name || !logoInfo?.current.file) return
        const inputParam = [glb_sv.branchId, logoInfo?.current.type, logoInfo?.current.size, logoInfo?.current.file, logoInfo?.current.name]
        sendRequest(serviceInfo.UPDATE_LOGO, inputParam, handleResultUpdateLogo, true, handleTimeOut)
    }

    const handleResultUpdateLogo = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            logoInfo.current = {
                file: null,
                name: '',
                type: '',
                size: 0
            }
            setModalPreviewImage(false)
            setPreviewImage(null)
            handleRefresh()
        }
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={process}>
                <CircularProgress color='inherit' />
            </Backdrop>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                    <Card className='mb-2'>
                        <CardHeader
                            title={t('menu.setting-pharmacy')}
                        />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={12} className='d-flex' justify='center' alignItems='center'>
                                    <div className={classes.root}>
                                        <Badge className='badge-logo'
                                            overlap="circular"
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            badgeContent={
                                                <>
                                                    <input
                                                        accept='image/png, image/jpeg'
                                                        className={classes.input}
                                                        id='contained-button-file'
                                                        type='file'
                                                        onChange={handleUploadClick}
                                                    />
                                                    <label htmlFor='contained-button-file' title={t('update_pharmacy_logo')} style={{ margin: 0 }}>
                                                        <IC_CAMERA />
                                                    </label>
                                                </>
                                                // <SmallAvatar alt="Camera" src="/static/images/avatar/1.jpg" />
                                            }
                                        >
                                            <Avatar alt='Logo' src={`http://171.244.133.198:5555/upload/comp_logo/${pharmacyInfo.o_12}`} className={classes.large} />
                                        </Badge>
                                    </div>
                                    {/* <input
                                        accept='image/png, image/jpeg'
                                        className={classes.input}
                                        id='contained-button-file'
                                        type='file'
                                        onChange={handleUploadClick}
                                    />
                                    <label htmlFor='contained-button-file'>
                                    </label> */}
                                </Grid>
                            </Grid>
                            <Grid container spacing={1}>
                                <Grid item xs={6} sm={8}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.pharmacyName')}
                                        name='o_2'
                                        value={pharmacyInfo.o_2 || ''}
                                        variant="outlined"
                                        onChange={handleChange}
                                        inputRef={step1Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step2Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.licence')}
                                        onChange={handleChange}
                                        name='o_6'
                                        value={pharmacyInfo.o_6 || ''}
                                        variant="outlined"
                                        inputRef={step2Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step3Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6} sm={8}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.licence_pl')}
                                        onChange={handleChange}
                                        name='o_8'
                                        value={pharmacyInfo.o_8 || ''}
                                        variant="outlined"
                                        inputRef={step3Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step4Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker
                                            disableToolbar
                                            margin="dense"
                                            variant="outlined"
                                            style={{ width: '100%' }}
                                            inputVariant="outlined"
                                            format="dd/MM/yyyy"
                                            id="licence_dt-picker-inline"
                                            label={t('pharmacy.licence_dt')}
                                            value={pharmacyInfo.o_7 || null}
                                            onChange={handleDateChange}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                            inputRef={step4Ref}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    step5Ref.current.focus()
                                                }
                                            }}
                                        />
                                    </MuiPickersUtilsProvider>
                                </Grid>

                                <Grid item xs={12} sm={12}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.address')}
                                        onChange={handleChange}
                                        name='o_5'
                                        value={pharmacyInfo.o_5 || ''}
                                        variant="outlined"
                                        inputRef={step5Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step6Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Divider />

                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.boss_name')}
                                        onChange={handleChange}
                                        name='o_9'
                                        value={pharmacyInfo.o_9 || ''}
                                        variant="outlined"
                                        inputRef={step6Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step7Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.boss_phone')}
                                        onChange={handleChange}
                                        name='o_10'
                                        value={pharmacyInfo.o_10 || ''}
                                        variant="outlined"
                                        inputRef={step7Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                step8Ref.current.focus()
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        fullWidth={true}
                                        margin="dense"
                                        autoComplete="off"
                                        label={t('pharmacy.boss_email')}
                                        onChange={handleChange}
                                        name='o_11'
                                        value={pharmacyInfo.o_11 || ''}
                                        variant="outlined"
                                        inputRef={step8Ref}
                                        onKeyPress={event => {
                                            if (event.key === 'Enter') {
                                                handleUpdate()
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                            <Button size='small'
                                onClick={() => {
                                    handleUpdate();
                                }}
                                variant="contained"
                                disabled={checkValidate()}
                                className={checkValidate() === false ? process ? 'button-loading bg-success text-white' : 'bg-success text-white' : ''}
                                endIcon={process && <LoopIcon />}
                            >
                                {t('btn.update')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={modalPreviewImage}
            >
                <Card>
                    <CardHeader title={t('update_pharmacy_logo')} />
                    <CardContent>
                        <div className='d-flex' style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar alt='Logo' src={previewImage} className={classes.large} />
                        </div>
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button size='small'
                            onClick={e => {
                                setModalPreviewImage(false)
                                setPreviewImage(null)
                            }}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')}
                        </Button>
                        <Button size='small'
                            onClick={e => {
                                uploadFileToServer()
                            }}
                            className='bg-success text-white'
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.update')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default PharmacyList