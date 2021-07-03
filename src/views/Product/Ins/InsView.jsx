import React from 'react'
import { Link } from 'react-router-dom'
import T from 'prop-types'
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import NumberFormat from 'react-number-format'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'
import LoadingView from '../../../components/Loading/View'
import TextInput from '../../../components/InputCustom/TextInput'
import Paper from '@material-ui/core/Paper'
//----------
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'

const useStylesBootstrap = makeStyles(theme => ({
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}))

function BootstrapTooltip(props) {
    const classes = useStylesBootstrap()
    return <Tooltip arrow placement="top" classes={classes} {...props} />
}

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    )
}

TabPanel.propTypes = {
    children: T.node,
    index: T.any.isRequired,
    value: T.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    bgrClr: {
        backgroundColor: '#EEEEEE',
    },
    boxSadown: {
        boxSadown:
            '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    },
    divider: {
        margin: theme.spacing(2, 0),
    },
}))

const InsView = ({
    loading,

    dataType,
    dataUnitTime,
    dataUnit,
    id,

    productTypeId,
    changeProductTypeId,

    name,
    changeName,

    barcode,
    changeBarcode,

    price,
    changePrice,

    wholePrice,
    changeWholePrice,

    originalPrice,
    changeOriginalPrice,

    unitId,
    changeUnitId,

    minQty,
    changeMinQty,

    maxQty,
    changeMaxQty,

    time,
    changeTime,

    unitTimeId,
    changeUnitTimeId,

    vat,
    changeVat,

    contents,
    changeContents,

    packing,
    changePacking,

    manufact,
    changeManufact,

    designate,
    changeDesignate,

    contraind,
    changeContraind,

    dosage,
    changeDosage,

    warned,
    changeWarned,

    interact,
    changeInteract,

    pregb,
    changePregb,

    effect,
    changeEffect,

    overdose,
    changeOverdose,

    storages,
    changeStorages,

    checkValidate,
    submitFunct,
}) => {
    const { t } = useTranslation()

    const classes = useStyles()
    const [value, setValue] = React.useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    if (loading) {
        return <LoadingView className={id < 0 ? 'd-no' : ''} />
    } else {
        return (
            <div className={classes.root}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="font-weight-bold m-0">{t('product.titleAdd')}</h6>
                </div>
                <Paper className="mb-1">
                    <AppBar position="static">
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="simple tabs example"
                            className={classes.bgrClr}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label={t('product.infoMain')} {...a11yProps(0)} />
                            <Tab label={t('product.infoExpand')} {...a11yProps(1)} />
                            <Tab label={t('product.config_info')} {...a11yProps(2)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0} className={classes.boxSadown}>
                        <div className="row">
                            <div className="col-md-9">
                                <div className="row">
                                    <div className="col-md-4">
                                        <TextField
                                            fullWidth={true}
                                            required
                                            autoFocus
                                            autoComplete="off"
                                            margin="dense"
                                            label={t('product.name')}
                                            onChange={changeName}
                                            value={name}
                                            variant="outlined"
                                            className="uppercaseInput"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <TextField
                                            fullWidth={true}
                                            required
                                            select
                                            variant="outlined"
                                            margin="dense"
                                            label={t('product.type')}
                                            value={productTypeId || ''}
                                            onChange={changeProductTypeId}
                                        >
                                            {dataType.map(item => (
                                                <MenuItem key={item.id} value={item.id} className="fz14">
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </div>
                                    <div className="col-md-3">
                                        <BootstrapTooltip title={t('product.tooltip.productCode')}>
                                            <TextField
                                                fullWidth={true}
                                                autoComplete="off"
                                                margin="dense"
                                                label={t('Mã sp')}
                                                onChange={changeName}
                                                value={name}
                                                variant="outlined"
                                                className="uppercaseInput"
                                            />
                                        </BootstrapTooltip>
                                    </div>
                                    <div className="col-md-2">
                                        <BootstrapTooltip title={t('product.tooltip.barcode')}>
                                            <TextField
                                                fullWidth={true}
                                                autoComplete="off"
                                                margin="dense"
                                                label={t('product.barcode')}
                                                onChange={changeBarcode}
                                                value={barcode}
                                                variant="outlined"
                                            />
                                        </BootstrapTooltip>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-7">
                                        <TextField
                                            fullWidth={true}
                                            margin="dense"
                                            multiline
                                            rows={2}
                                            autoComplete="off"
                                            label={t('product.contents')}
                                            onChange={changeContents}
                                            value={contents || ''}
                                            variant="outlined"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <TextField
                                            fullWidth={true}
                                            margin="dense"
                                            multiline
                                            rows={2}
                                            autoComplete="off"
                                            label={t('product.packing')}
                                            onChange={changePacking}
                                            value={packing || ''}
                                            variant="outlined"
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <TextField
                                            fullWidth={true}
                                            margin="dense"
                                            multiline
                                            rows={2}
                                            autoComplete="off"
                                            label={t('product.manufact')}
                                            onChange={changeManufact}
                                            value={manufact || ''}
                                            variant="outlined"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <NumberFormat
                                            fullWidth={true}
                                            value={wholePrice}
                                            label={t('product.store_current')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeWholePrice}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <TextField
                                            fullWidth={true}
                                            select
                                            variant="outlined"
                                            margin="dense"
                                            label={t('product.unit')}
                                            value={unitId || ''}
                                            onChange={changeUnitId}
                                        >
                                            {dataUnit.map(item => (
                                                <MenuItem key={item.id} value={item.id} className="fz14">
                                                    {item.unit_nm}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </div>
                                    <div className="col-md-2">
                                        <NumberFormat
                                            fullWidth={true}
                                            value={originalPrice}
                                            label={t('config.price.originalPrice')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeOriginalPrice}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <NumberFormat
                                            fullWidth={true}
                                            value={wholePrice}
                                            label={t('config.price.wholePrice')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeWholePrice}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <NumberFormat
                                            fullWidth={true}
                                            value={price}
                                            label={t('config.price.price')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changePrice}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </div>
                                </div>
                                <Divider className={classes.divider} />
                                <Grid container spacing={2}>
                                    <Grid item sm={3}>
                                        <NumberFormat
                                            fullWidth={true}
                                            value={vat}
                                            label={t('Thuế VAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeVat}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item sm={3}>
                                        <NumberFormat
                                            fullWidth={true}
                                            value={vat}
                                            label={t('Thuế VAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeVat}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item sm={3}>
                                        <NumberFormat
                                            fullWidth={true}
                                            value={vat}
                                            label={t('Thuế VAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeVat}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item sm={3}>
                                        <NumberFormat
                                            fullWidth={true}
                                            value={vat}
                                            label={t('Thuế VAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={changeVat}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                            <div className="col-md-3">
                                <img src="" minheight="400px" width="100%" height="100%" />
                                <br />
                                <span>Hình sản phẩm</span>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={1} className={classes.boxSadown}>
                        Item Two
                    </TabPanel>
                    <TabPanel value={value} index={2} className={classes.boxSadown}>
                        Item Three
                    </TabPanel>

                    <Grid container direction="row" justify="flex-end" alignItems="flex-start">
                        <span>AAAAA</span>
                    </Grid>
                </Paper>
            </div>

            // <>
            //     <div className="d-flex align-items-center justify-content-between mb-3">
            //         <h6 className="font-weight-bold m-0">{t('product.titleAdd')}</h6>
            //     </div>

            //     <div className="row">
            //         <div className="col-7">
            //             <div className="list-group-item p-2">
            //                 <div className="font-weight-500 fz14">{t('product.infoMain')}</div>
            //                 <div className="row">
            //                     <div className="col-6 pr-0 mb-4">
            //                         <TextField
            //                             fullWidth={true}
            //                             required
            //                             autoFocus
            //                             autoComplete="off"
            //                             margin="dense"
            //                             label={t('product.name')}
            //                             onChange={changeName}
            //                             value={name}
            //                             variant="outlined"
            //                             className="uppercaseInput"
            //                         />
            //                     </div>
            //                     <div className="col-3 pr-0">
            //                         <BootstrapTooltip title={t('product.tooltip.barcode')}>
            //                             <TextField
            //                                 fullWidth={true}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 label={t('product.barcode')}
            //                                 onChange={changeBarcode}
            //                                 value={barcode}
            //                                 variant="outlined"
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3">
            //                         <TextField
            //                             fullWidth={true}
            //                             required
            //                             select
            //                             variant="outlined"
            //                             margin="dense"
            //                             label={t('product.type')}
            //                             value={productTypeId || ''}
            //                             onChange={changeProductTypeId}
            //                         >
            //                             {dataType.map((item) => (
            //                                 <MenuItem key={item.id} value={item.id} className="fz14">
            //                                     {item.name}
            //                                 </MenuItem>
            //                             ))}
            //                         </TextField>
            //                     </div>
            //                 </div>

            //                 <div className="row">
            //                     <div className="col-3 pr-0  mb-4">
            //                         <BootstrapTooltip title={t('product.tooltip.price')}>
            //                             <NumberFormat
            //                                 fullWidth={true}
            //                                 value={wholePrice}
            //                                 label={t('config.price.wholePrice')}
            //                                 customInput={TextField}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 type="text"
            //                                 variant="outlined"
            //                                 thousandSeparator={true}
            //                                 onValueChange={changeWholePrice}
            //                                 inputProps={{
            //                                     min: 0
            //                                 }}
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3 pr-0">
            //                         <BootstrapTooltip title={t('product.tooltip.price')}>
            //                             <NumberFormat
            //                                 fullWidth={true}
            //                                 value={price}
            //                                 label={t('config.price.price')}
            //                                 customInput={TextField}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 type="text"
            //                                 variant="outlined"
            //                                 thousandSeparator={true}
            //                                 onValueChange={changePrice}
            //                                 inputProps={{
            //                                     min: 0
            //                                 }}
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3 pr-0">
            //                         <BootstrapTooltip title={t('product.tooltip.price')}>
            //                             <NumberFormat
            //                                 fullWidth={true}
            //                                 value={originalPrice}
            //                                 label={t('config.price.originalPrice')}
            //                                 customInput={TextField}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 type="text"
            //                                 variant="outlined"
            //                                 thousandSeparator={true}
            //                                 onValueChange={changeOriginalPrice}
            //                                 inputProps={{
            //                                     min: 0
            //                                 }}
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3">
            //                         <TextField
            //                             fullWidth={true}
            //                             select
            //                             variant="outlined"
            //                             margin="dense"
            //                             label={t('product.unit')}
            //                             value={unitId || ''}
            //                             onChange={changeUnitId}
            //                         >
            //                             {dataUnit.map((item) => (
            //                                 <MenuItem key={item.id} value={item.id} className="fz14">
            //                                     {item.unit_nm}
            //                                 </MenuItem>
            //                             ))}
            //                         </TextField>
            //                     </div>
            //                 </div>

            //                 <div className="row">
            //                     <div className="col-3 pr-0 mb-4">
            //                         <BootstrapTooltip title={t('product.tooltip.store')}>
            //                             <NumberFormat
            //                                 fullWidth={true}
            //                                 value={minQty}
            //                                 label={t('config.storeLimit.minQuantity')}
            //                                 customInput={TextField}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 type="text"
            //                                 variant="outlined"
            //                                 thousandSeparator={true}
            //                                 onValueChange={changeMinQty}
            //                                 inputProps={{
            //                                     min: 0
            //                                 }}
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3 pr-0">
            //                         <BootstrapTooltip title={t('product.tooltip.store')}>
            //                             <NumberFormat
            //                                 fullWidth={true}
            //                                 value={maxQty}
            //                                 label={t('config.storeLimit.maxQuantity')}
            //                                 customInput={TextField}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 type="text"
            //                                 variant="outlined"
            //                                 thousandSeparator={true}
            //                                 onValueChange={changeMaxQty}
            //                                 inputProps={{
            //                                     min: 0
            //                                 }}
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3 pr-0">
            //                         <BootstrapTooltip title={t('product.tooltip.warnTime')}>
            //                             <NumberFormat
            //                                 fullWidth={true}
            //                                 value={time}
            //                                 label={t('config.warnTime.time')}
            //                                 customInput={TextField}
            //                                 autoComplete="off"
            //                                 margin="dense"
            //                                 type="text"
            //                                 variant="outlined"
            //                                 thousandSeparator={true}
            //                                 onValueChange={changeTime}
            //                                 inputProps={{
            //                                     min: 0
            //                                 }}
            //                             />
            //                         </BootstrapTooltip>
            //                     </div>
            //                     <div className="col-3">
            //                         <TextField
            //                             fullWidth={true}
            //                             select
            //                             variant="outlined"
            //                             margin="dense"
            //                             label={t('product.unitTime')}
            //                             value={unitTimeId || ''}
            //                             onChange={changeUnitTimeId}
            //                         >
            //                             {dataUnitTime.map((item) => (
            //                                 <MenuItem key={item.id} value={item.id}>
            //                                     {item.name}
            //                                 </MenuItem>
            //                             ))}
            //                         </TextField>
            //                     </div>
            //                 </div>

            //                 <div className="row">
            //                     <div className="col-6 pr-0">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={5}
            //                             autoComplete="off"
            //                             label={t('product.contents')}
            //                             onChange={changeContents}
            //                             value={contents || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                     <div className="col-3 pr-0">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={5}
            //                             autoComplete="off"
            //                             label={t('product.packing')}
            //                             onChange={changePacking}
            //                             value={packing || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                     <div className="col-3">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={5}
            //                             autoComplete="off"
            //                             label={t('product.manufact')}
            //                             onChange={changeManufact}
            //                             value={manufact || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                 </div>

            //             </div>
            //         </div>
            //         <div className="col-5 pl-0">
            //             <div className="list-group-item p-2">
            //                 <div className="font-weight-500 fz14">{t('product.infoExpand')}</div>
            //                 <div className="row">
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.designate')}
            //                             onChange={changeDesignate}
            //                             value={designate || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.contraind')}
            //                             onChange={changeContraind}
            //                             value={contraind || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                 </div>
            //                 <div className="row">
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.dosage')}
            //                             onChange={changeDosage}
            //                             value={dosage || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.warned')}
            //                             onChange={changeWarned}
            //                             value={warned || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                 </div>
            //                 <div className="row">
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.interact')}
            //                             onChange={changeInteract}
            //                             value={interact || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.pregb')}
            //                             onChange={changePregb}
            //                             value={pregb || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                 </div>
            //                 <div className="row">
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.effect')}
            //                             onChange={changeEffect}
            //                             value={effect || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                     <div className="col-6">
            //                         <TextField
            //                             fullWidth={true}
            //                             margin="dense"
            //                             multiline
            //                             rows={2}
            //                             autoComplete="off"
            //                             label={t('product.overdose')}
            //                             onChange={changeOverdose}
            //                             value={overdose || ''}
            //                             variant="outlined"
            //                         />
            //                     </div>
            //                 </div>
            //                 <TextField
            //                     fullWidth={true}
            //                     margin="dense"
            //                     multiline
            //                     rows={2}
            //                     autoComplete="off"
            //                     label={t('product.storages')}
            //                     onChange={changeStorages}
            //                     value={storages || ''}
            //                     variant="outlined"
            //                 />
            //             </div>
            //         </div>
            //     </div>

            //     <Grid container spacing={3}>
            //         <TextInput
            //         columnswidth={3}
            //             fullWidth={true}
            //             margin="dense"
            //             multiline
            //             rows={3}
            //             autoComplete="off"
            //             label={t('product.storages')}
            //             onChange={changeStorages}
            //             value={storages || ''}
            //             variant="outlined"
            //         />
            //         <TextInput
            //             columnswidth={6}
            //             fullWidth={true}
            //             margin="dense"
            //             multiline
            //             rows={1}
            //             autoComplete="off"
            //             label={t('product.storages')}
            //             onChange={changeStorages}
            //             value={storages || ''}
            //             variant="outlined"
            //         />
            //         <TextInput
            //             columnswidth={2}
            //             fullWidth={true}
            //             margin="dense"
            //             multiline
            //             rows={2}
            //             autoComplete="off"
            //             label={t('product.storages')}
            //             onChange={changeStorages}
            //             value={storages || ''}
            //             variant="outlined"
            //         />
            //     </Grid>

            //     <div className="text-right mt-3">
            //         <Link to="/page/product/get-list" className="mr-3 normalLink">
            //             <Button variant="contained" disableElevation>
            //                 {t('btn.back')}
            //             </Button>
            //         </Link>
            //         <Button onClick={submitFunct} variant="contained" startIcon={<SaveIcon />} disabled={checkValidate()} className={checkValidate() === false ? 'bg-success text-white' : ''}>
            //             {t('btn.save')}
            //         </Button>
            //     </div>
            // </>
        )
    }
}

InsView.propTypes = {
    loading: T.bool,

    dataType: T.array,
    dataUnitTime: T.array,
    dataUnit: T.array,
    id: T.any,

    productTypeId: T.string,
    changeProductTypeId: T.func,

    name: T.string,
    changeName: T.func,

    barcode: T.string,
    changeBarcode: T.func,

    price: T.number,
    changePrice: T.func,

    wholePrice: T.number,
    changeWholePrice: T.func,

    originalPrice: T.number,
    changeOriginalPrice: T.func,

    unitId: T.string,
    changeUnitId: T.func,

    minQty: T.number,
    changeMinQty: T.func,

    maxQty: T.number,
    changeMaxQty: T.func,

    time: T.number,
    changeTime: T.func,

    unitTimeId: T.string,
    changeUnitTimeId: T.func,

    contents: T.string,
    changeContents: T.func,

    packing: T.string,
    changePacking: T.func,

    manufact: T.string,
    changeManufact: T.func,

    manufact: T.string,
    changeManufact: T.func,

    designate: T.string,
    changeDesignate: T.func,

    contraind: T.string,
    changeContraind: T.func,

    dosage: T.string,
    changeDosage: T.func,

    warned: T.string,
    changeWarned: T.func,

    interact: T.string,
    changeInteract: T.func,

    pregb: T.string,
    changePregb: T.func,

    effect: T.string,
    changeEffect: T.func,

    overdose: T.string,
    changeOverdose: T.func,

    storages: T.string,
    changeStorages: T.func,

    checkValidate: T.func,
    submitFunct: T.func,

    vat: T.number,
    changeVat: T.func,
}

export default InsView
