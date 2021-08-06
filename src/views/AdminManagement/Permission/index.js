import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import {
    Card, CardHeader, CardContent, CircularProgress, Backdrop, makeStyles, Grid, FormGroup, FormLabel, FormControl, FormControlLabel, Checkbox, Divider,
    Accordion, AccordionDetails, AccordionSummary, Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

import User_Autocomplete from '../User/Control/User.Autocomplete'

const serviceInfo = {
    GET_PERMISSION: {
        functionName: 'get_perm',
        reqFunct: reqFunction.PERMISSION_BY_ID,
        biz: 'admin',
        object: 'permission'
    },
    UPDATE_PERMISSION: {
        functionName: 'update',
        reqFunct: reqFunction.PERMISSION_UPDATE,
        biz: 'admin',
        object: 'permission'
    }
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    heading: {
        // fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        // fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}));

const Permission = ({ }) => {
    const { t } = useTranslation()
    const history = useHistory()
    const classes = useStyles()
    const { userID } = history?.location?.state || ''

    const [listPermission, setListPermission] = useState({})
    const [IDUser, setIDUser] = useState(userID)
    const [process, setProcess] = useState(false)
    const [expanded, setExpanded] = useState('10') // id thằng sản phẩm

    useEffect(() => {
        setIDUser(userID)
        return () => {
            history.replace({
                ...history?.location,
                state: undefined,
            });
        }
    }, [userID])

    useEffect(() => {
        if (!!IDUser && IDUser !== '') {
            setProcess(true)
            const inputParam = [glb_sv.branchId || 0, IDUser];
            sendRequest(serviceInfo.GET_PERMISSION, inputParam, handleResultGetPermission, true, handleTimeOut)
        }
    }, [IDUser])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
    }

    const handleResultGetPermission = (reqInfoMap, message) => {
        setProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setListPermission({})
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            let dataConverted = convertData(newData.rows)
            setListPermission(dataConverted)
        }
    }

    const convertData = (list) => {
        const newData = list.reduce((accumulator, currentValue) => {
            let key = currentValue.o_1;
            if (accumulator[key]) {
                accumulator[key]['result'].push({
                    scrn_cd: currentValue.o_3,
                    scrn_nm: currentValue.o_4,
                    ins_yn: currentValue.o_5 === 'N' ? true : false,
                    rgt_ins: currentValue.o_6 === 'Y' ? true : false,
                    upd_yn: currentValue.o_7 === 'N' ? true : false,
                    rgt_upd: currentValue.o_8 === 'Y' ? true : false,
                    del_yn: currentValue.o_9 === 'N' ? true : false,
                    rgt_del: currentValue.o_10 === 'Y' ? true : false,
                    qry_yn: currentValue.o_11 === 'N' ? true : false,
                    rgt_qry: currentValue.o_12 === 'Y' ? true : false
                });
            } else {
                accumulator[key] = {
                    parent_cd: key,
                    parent_nm: currentValue.o_2,
                    result: [].concat({
                        scrn_cd: currentValue.o_3,
                        scrn_nm: currentValue.o_4,
                        ins_yn: currentValue.o_5 === 'N' ? true : false,
                        rgt_ins: currentValue.o_6 === 'Y' ? true : false,
                        upd_yn: currentValue.o_7 === 'N' ? true : false,
                        rgt_upd: currentValue.o_8 === 'Y' ? true : false,
                        del_yn: currentValue.o_9 === 'N' ? true : false,
                        rgt_del: currentValue.o_10 === 'Y' ? true : false,
                        qry_yn: currentValue.o_11 === 'N' ? true : false,
                        rgt_qry: currentValue.o_12 === 'Y' ? true : false
                    })
                };
            }
            return accumulator;
        }, {});
        return newData;
    };

    const handleChange = (item, name, checked) => {
        setProcess(true)
        const inputParam = [
            glb_sv.branchId || 0,
            IDUser,
            item.scrn_cd,
            name === 'rgt_ins' ? (checked ? 'Y' : 'N') : (item.rgt_ins ? 'Y' : 'N'),
            name === 'rgt_upd' ? (checked ? 'Y' : 'N') : (item.rgt_upd ? 'Y' : 'N'),
            name === 'rgt_del' ? (checked ? 'Y' : 'N') : (item.rgt_del ? 'Y' : 'N'),
            name === 'rgt_qry' ? (checked ? 'Y' : 'N') : (item.rgt_qry ? 'Y' : 'N')
        ];
        sendRequest(serviceInfo.UPDATE_PERMISSION, inputParam, handleResultUpdatePermission, true, handleTimeOut)
        // setListPermission({})
    }

    const handleResultUpdatePermission = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            setProcess(false)
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            const inputParam = [glb_sv.branchId || 0, IDUser];
            sendRequest(serviceInfo.GET_PERMISSION, inputParam, handleResultGetPermission, true, handleTimeOut)
        }
    }

    const handleSelectUser = obj => {
        if (!!obj) {
            setIDUser(!!obj ? obj?.o_2 : '')
        } else {
            setListPermission({})
        }
    }

    const handleChangeAccordion = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    }

    return (
        <div className='d-flex'>
            <Backdrop className={classes.backdrop} open={process}>
                <CircularProgress color='inherit' />
            </Backdrop>
            <Grid container spacing={2}>
                <Grid item xs className='mb-2'>
                    <Grid item xs={3}>
                        <User_Autocomplete
                            size={'small'}
                            label={t('user.userID')}
                            onSelect={handleSelectUser}
                            value={IDUser}
                            autoSelectOnce={true}
                        />
                    </Grid>
                </Grid>
                <Grid xs={12}>
                    <FormGroup className='w-100 permission-group'>
                        {Object.keys(listPermission).length > 0 ?
                            Object.values(listPermission)?.map((item, index) => (
                                <Accordion expanded={expanded === item.parent_cd} onChange={handleChangeAccordion(item.parent_cd)}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`${item.parent_cd}-content`}
                                        id={`${item.parent_cd}-header`}
                                    >
                                        <Typography className={classes.heading}>{item.parent_nm}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography className='w-100'>
                                            {item?.result?.map((control, indexControl) => (
                                                <>
                                                    <FormControl className='d-flex permission' key={control.scrn_cd + indexControl} component='fieldset'>
                                                        <FormGroup row>
                                                            <FormControlLabel className='title-screen ml-2' control={<span />} label={control.scrn_nm} />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox disabled={control.ins_yn}
                                                                        checked={control.rgt_ins}
                                                                        onChange={(event, checked) => handleChange(control, event.target.name, checked)}
                                                                        name='rgt_ins'
                                                                    />
                                                                }
                                                                label={t('permission.ins')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox disabled={control.upd_yn}
                                                                        checked={control.rgt_upd}
                                                                        onChange={(event, checked) => handleChange(control, event.target.name, checked)}
                                                                        name='rgt_upd'
                                                                    />
                                                                }
                                                                label={t('permission.upd')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox disabled={control.del_yn}
                                                                        checked={control.rgt_del}
                                                                        onChange={(event, checked) => handleChange(control, event.target.name, checked)}
                                                                        name='rgt_del'
                                                                    />
                                                                }
                                                                label={t('permission.del')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox disabled={control.qry_yn}
                                                                        checked={control.rgt_qry}
                                                                        onChange={(event, checked) => handleChange(control, event.target.name, checked)}
                                                                        name='rgt_qry'
                                                                    />
                                                                }
                                                                label={t('permission.query')}
                                                            />
                                                        </FormGroup>
                                                    </FormControl>
                                                    {item?.result.length > indexControl + 1 && <Divider key={control.scrn_cd + indexControl} orientation="horizontal" flexItem />}
                                                </>
                                            ))}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                            : null}
                    </FormGroup>
                </Grid>
            </Grid>
        </div>
    )
}

export default Permission;
