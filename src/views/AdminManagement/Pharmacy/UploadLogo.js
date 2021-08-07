import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Button, Chip, IconButton, Grid, TextField, FormControl, MenuItem, Select, InputLabel, Tooltip, InputAdornment, makeStyles, Fab, Avatar
} from '@material-ui/core'
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'


const serviceInfo = {
    UPDATE_LOGO: {
        functionName: 'update_logo',
        reqFunct: reqFunction.UPDATE_LOGO,
        biz: 'admin',
        object: 'pharmacy'
    }
}


const useStyles = makeStyles((theme) => ({
    button: {
        margin: 10
    },
    input: {
        display: 'none'
    },
    large: {
        width: theme.spacing(15),
        height: theme.spacing(15),
    },
}))

const UploadLogo = ({ }) => {
    const { t } = useTranslation()
    const classes = useStyles()

    const [process, setProcess] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const logoInfo = useRef({
        file: null,
        name: '',
        type: '',
        size: 0
    })

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
            console.log('fileUpload: ', fileUpload)
            const reader = new FileReader()
            const reader2 = new FileReader()

            reader.readAsBinaryString(fileUpload)
            reader2.readAsArrayBuffer(fileUpload)

            reader.onloadend = e => {
                // logoInfo.current.file = [reader2.result]
                // logoInfo.current.name = fileUpload?.name
                // logoInfo.current.type = fileUpload?.type.substr(6)
                // logoInfo.current.size = fileUpload?.size
                // uploadFileToServer()
            }

            reader2.onloadend = e => {
                logoInfo.current.file = reader2.result
                logoInfo.current.name = fileUpload?.name
                logoInfo.current.type = fileUpload?.type.substr(6)
                logoInfo.current.size = fileUpload?.size
                uploadFileToServer()
                setPreviewImage(e.target.result)
            }
        }
    }

    const uploadFileToServer = () => {
        if (!logoInfo?.current || !logoInfo?.current.type || !logoInfo?.current.size || !logoInfo?.current.name || !logoInfo?.current.file) return
        const inputParam = [glb_sv.branchId, logoInfo?.current.type, logoInfo?.current.size, logoInfo?.current.file, logoInfo?.current.name]
        sendRequest(serviceInfo.UPDATE_LOGO, inputParam, handleResultUpdateLogo, true, handleTimeOut)
    }

    const handleResultUpdateLogo = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            console.log('xử lý thành công')
            logoInfo.current = {
                file: null,
                name: '',
                type: '',
                size: 0
            }
            setPreviewImage(null)
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        console.log('handleTimeOut')
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} className='d-flex' justify='center' alignItems='center'>
                <input
                    accept='image/png, image/jpeg'
                    className={classes.input}
                    id='contained-button-file'
                    type='file'
                    onChange={handleUploadClick}
                />
                <label htmlFor='contained-button-file'>
                    <Avatar alt='Logo' src={previewImage ? previewImage : import('../../../asset/images/noavatar.png')} className={classes.large} />
                </label>
            </Grid>
        </Grid>
    )
}

export default UploadLogo
