import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import {
    Card, CardHeader, CardContent, CardActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog,
    Button, Chip, IconButton, Grid, TextField, MenuItem, Select, InputLabel, Tooltip, FormGroup, FormLabel, FormControl, FormControlLabel, Checkbox
} from '@material-ui/core'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions';
import sendRequest from '../../../utils/service/sendReq'

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

const Permission = ({ }) => {
    const { t } = useTranslation()
    const history = useHistory()
    const { userID } = history?.location?.state || 0

    const [listPermission, setListPermission] = useState([])

    useEffect(() => {
        if (!!userID && userID !== 0) {
            const inputParam = [0, userID];
            sendRequest(serviceInfo.GET_PERMISSION, inputParam, handleResultGetPermission, true, handleTimeOut)
        } else {
            history.push('/page/management/user')
        }
        return () => {
            history.replace({
                ...history?.location,
                state: undefined,
            });
        }
    }, [userID])

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleResultGetPermission = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            let dataConverted = convertData(newData.rows)
            console.log('newData: ', newData.rows)
            console.log('data converted: ', dataConverted)
            setListPermission(dataConverted)
        }
    }

    const convertData = (list) => {
        const newData = list.reduce((accumulator, currentValue) => {
            let key = currentValue.o_1;
            if (accumulator[key]) {
                accumulator[key]["result"].push({
                    scrn_cd: currentValue.o_3,
                    scrn_nm: currentValue.o_4,
                    ins_yn: currentValue.o_5 === "N" ? true : false,
                    rgt_ins: currentValue.o_6 === "Y" ? true : false,
                    upd_yn: currentValue.o_7 === "N" ? true : false,
                    rgt_upd: currentValue.o_8 === "Y" ? true : false,
                    del_yn: currentValue.o_9 === "N" ? true : false,
                    rgt_del: currentValue.o_10 === "Y" ? true : false,
                    qry_yn: currentValue.o_11 === "N" ? true : false,
                    rgt_qry: currentValue.o_12 === "Y" ? true : false
                });
            } else {
                accumulator[key] = {
                    parent_cd: key,
                    parent_nm: currentValue.o_2,
                    result: [].concat({
                        scrn_cd: currentValue.o_3,
                        scrn_nm: currentValue.o_4,
                        ins_yn: currentValue.o_5 === "N" ? true : false,
                        rgt_ins: currentValue.o_6 === "Y" ? true : false,
                        upd_yn: currentValue.o_7 === "N" ? true : false,
                        rgt_upd: currentValue.o_8 === "Y" ? true : false,
                        del_yn: currentValue.o_9 === "N" ? true : false,
                        rgt_del: currentValue.o_10 === "Y" ? true : false,
                        qry_yn: currentValue.o_11 === "N" ? true : false,
                        rgt_qry: currentValue.o_12 === "Y" ? true : false
                    })
                };
            }
            return accumulator;
        }, {});
        return newData;
    };

    const handleChange = e => {
        console.log(e.target.name, e.target.checked);
    }

    return (
        <div className='d-flex'>
            <FormGroup>
                {Object.keys(listPermission).length > 0 ?
                    Object.values(listPermission)?.map((item, index) => (
                        <Card className='mb-2' key={item.parent_cd + index}>
                            <CardHeader title={item.parent_nm} />
                            <CardContent key={item.parent_cd}>
                                {item?.result?.map((control, indexControl) => (
                                    <FormControl key={control.scrn_cd + indexControl} component="fieldset">
                                        <FormLabel component="legend">{control.scrn_nm}</FormLabel>
                                        <FormGroup row>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox disabled={control.ins_yn}
                                                        checked={control.rgt_ins}
                                                        onChange={handleChange}
                                                        name="rgt_ins"
                                                    />
                                                }
                                                label={t('permission.ins')}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox disabled={control.upd_yn}
                                                        checked={control.rgt_upd}
                                                        onChange={handleChange}
                                                        name="rgt_upd"
                                                    />
                                                }
                                                label={t('permission.upd')}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox disabled={control.del_yn}
                                                        checked={control.rgt_del}
                                                        onChange={handleChange}
                                                        name="rgt_del"
                                                    />
                                                }
                                                label={t('permission.del')}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox disabled={control.qry_yn}
                                                        checked={control.rgt_qry}
                                                        onChange={handleChange}
                                                        name="rgt_qry"
                                                    />
                                                }
                                                label={t('permission.query')}
                                            />
                                        </FormGroup>
                                    </FormControl>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                    : null}
            </FormGroup>
        </div>
    )
}

export default Permission;
