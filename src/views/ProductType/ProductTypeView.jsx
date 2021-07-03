import React from "react";
import style from "./ProductType.module.css";
import { useTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

const ProductTypeView = () => {

    const { t } = useTranslation();

    const [openEdit, setOpenEdit] = React.useState(false);

    const [openRemove, setOpenRemove] = React.useState(false);

    const [openAdd, setOpenAdd] = React.useState(false);

    const handleClickOpenRemove = () => {
        setOpenRemove(true);
    };

    const handleClickOpenEdit = () => {
        setOpenEdit(true);
    };

    const handleClickOpenAdd = () => {
        setOpenAdd(true);
    };

    const handleCloseRemove = () => {
        setOpenRemove(false);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
    };

    return (
        <>
            <List className="bg-white p-0"
                component="nav"
                subheader={
                    <ListSubheader component="div" className="listSubHeader">
                        {t('productType.title')}
                    </ListSubheader>
                }
            >
                <ListItem button>
                    <ListItemText primary="Loại 1" onClick={handleClickOpenEdit} />
                    <ListItemSecondaryAction>
                        <IconButton onClick={handleClickOpenRemove}>
                            <Tooltip title={t('btn.delete')} placement="top">
                                <DeleteIcon />
                            </Tooltip>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem button className="p-0" style={{ background: '#eee' }} onClick={handleClickOpenAdd}>
                    <ListItemText className="text-center">
                        <Tooltip title={t('btn.add')} placement="top">
                            <AddIcon />
                        </Tooltip>
                    </ListItemText>
                </ListItem>
            </List>

            {/* add */}
            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={openAdd}
                onClose={handleCloseAdd}
            >
                <DialogTitle className="pt-2 pb-0">{t('productType.titleAdd')}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth={true}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd}>
                        {t('btn.close')}
                    </Button>
                    <Button onClick={handleCloseAdd} variant="contained" className="bg-success text-white">
                        {t('btn.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* edit */}
            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={openEdit}
                onClose={handleCloseEdit}
            >
                <DialogTitle className="pt-2 pb-0">{t('lbl.edit')}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth={true}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>
                        {t('btn.close')}
                    </Button>
                    <Button onClick={handleCloseEdit} variant="contained" className="bg-success text-white">
                        {t('btn.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* remove */}
            <Dialog
                open={openRemove}
                onClose={handleCloseRemove}
            >
                <DialogContent>
                    <DialogContentText className="m-0 text-dark">{t('productType.remove')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRemove}>
                        {t('btn.close')}
                    </Button>
                    <Button onClick={handleCloseRemove} variant="contained" color="secondary">
                        {t('btn.agree')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

ProductTypeView.propTypes = {
}

export default ProductTypeView;
