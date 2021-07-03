import React from "react";
import { Link } from 'react-router-dom';
import T from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import LoadingView from '../../../components/Loading/View';
import NumberInput from '../../../components/InputCustom/NumberInput'
import TextInput from '../../../components/InputCustom/TextInput'

const InsCusView = ({
    loading,

    // dataType,
    // dataUnitTime,
    // dataUnit,
    id,

    name,
    changeName,
    
    phone,
    changePhone,

    addr,
    changeAddr,

    email,
    changeEmail,

    fax,
    changeFax,

    nameEN,
    changeNameEN,

    shortNm,
    changeShortNm,

    website,
    changeWebsite,

    taxCd,
    changeTaxCd,

    bankActNo,
    changeBankActNo,

    bankActNm,
    changeBankActNm,

    bankNm,
    changeBankNm,

    agentNm,
    changeAgentNm,

    agentFul,
    changeAgentFul,

    agentAddr,
    changeAgentAddr,

    agentPhone,
    changeAgentPhone,

    agentEmail,
    changeAgentEmail,

    checkValidate,
    submitFunct
}) => {

    const { t } = useTranslation();

    if (loading) {
        return (<LoadingView className={id < 0 ? 'd-no' : ''} />)
    } else {
        return ( //partner.customer.
            <>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="font-weight-bold m-0">{t('partner.customer.titleAdd')}</h6>
                </div>

                <Grid container spacing={2}>
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={1}
                        autoComplete="off"
                        label={t('partner.customer.cust_nm_v')}
                        onChange={changeName}
                        value={name || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={1}
                        autoComplete="off"
                        label={t('partner.customer.phone')}
                        onChange={changePhone}
                        value={phone || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.address')}
                        onChange={changeAddr}
                        value={addr || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.email')}
                        onChange={changeEmail}
                        value={email || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.fax')}
                        onChange={changeFax}
                        value={fax || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.cust_nm_e')}
                        onChange={changeNameEN}
                        value={nameEN || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.cust_nm_short')}
                        onChange={changeShortNm}
                        value={shortNm || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.website')}
                        onChange={changeWebsite}
                        value={website || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.tax_cd')}
                        onChange={changeTaxCd}
                        value={taxCd || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.bank_acnt_no')}
                        onChange={changeBankActNo}
                        value={bankActNo || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.bank_acnt_nm')}
                        onChange={changeBankActNm}
                        value={bankActNm || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.bank_nm')}
                        onChange={changeBankNm}
                        value={bankNm || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.agent_nm')}
                        onChange={changeAgentNm}
                        value={agentNm || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.agent_fun')}
                        onChange={changeAgentFul}
                        value={agentFul || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.agent_address')}
                        onChange={changeAgentAddr}
                        value={agentAddr || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.agent_phone')}
                        onChange={changeAgentPhone}
                        value={agentPhone || ''}
                        variant="outlined"
                    />
                    <TextInput
                        columnswidth={3}
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        autoComplete="off"
                        label={t('partner.customer.agent_email')}
                        onChange={changeAgentEmail}
                        value={agentEmail || ''}
                        variant="outlined"
                    />
                </Grid>
                <div className="text-right mt-3">
                    <Link to="/page/partner/customer" className="mr-3 normalLink">
                        <Button variant="contained" disableElevation>
                            {t('btn.back')}
                        </Button>
                    </Link>
                    <Button onClick={submitFunct} variant="contained" startIcon={<SaveIcon />} disabled={checkValidate()} className={checkValidate() === false ? 'bg-success text-white' : ''}>
                        {t('btn.save')}
                    </Button>
                </div>
            </>
        )
    }
}

InsCusView.propTypes = {
    loading: T.bool,

    // dataType: T.array,
    // dataUnitTime: T.array,
    // dataUnit: T.array,
    // id: T.any,

    // productTypeId: T.string,
    // changeProductTypeId: T.func,

    // name: T.string,
    // changeName: T.func,

    // barcode: T.string,
    // changeBarcode: T.func,

    // price: T.number,
    // changePrice: T.func,

    // wholePrice: T.number,
    // changeWholePrice: T.func,

    // originalPrice: T.number,
    // changeOriginalPrice: T.func,

    // unitId: T.string,
    // changeUnitId: T.func,

    // minQty: T.number,
    // changeMinQty: T.func,

    // maxQty: T.number,
    // changeMaxQty: T.func,

    // time: T.number,
    // changeTime: T.func,

    // unitTimeId: T.string,
    // changeUnitTimeId: T.func,

    // contents: T.string,
    // changeContents: T.func,

    // packing: T.string,
    // changePacking: T.func,

    // manufact: T.string,
    // changeManufact: T.func,

    // manufact: T.string,
    // changeManufact: T.func,

    // designate: T.string,
    // changeDesignate: T.func,

    // contraind: T.string,
    // changeContraind: T.func,

    // dosage: T.string,
    // changeDosage: T.func,

    // warned: T.string,
    // changeWarned: T.func,

    // interact: T.string,
    // changeInteract: T.func,

    // pregb: T.string,
    // changePregb: T.func,

    // effect: T.string,
    // changeEffect: T.func,

    // overdose: T.string,
    // changeOverdose: T.func,

    // storages: T.string,
    // changeStorages: T.func,

    checkValidate: T.func,
    submitFunct: T.func
}

export default InsCusView;