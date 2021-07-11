import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const UnitView = ({ Bname, Bnote, shouldOpenModal, handleCloseViewModal}) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')

    useEffect(() => {
        setName(Bname)
        setNote(Bnote)
    }, [Bname, Bnote])


    return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={shouldOpenModal}
            onClose={e => {
                handleCloseViewModal(false)
                setNote('')
                setName('')
            }}
        >
            <DialogTitle className="titleDialog pb-0">
                {t('viewDetail', { name: name })}
            </DialogTitle>
            <DialogContent className="pt-0">
                <TextField
                    fullWidth={true}
                    disabled={true}
                    required
                    autoFocus
                    autoComplete="off"
                    margin="dense"
                    label={t('config.unit.name')}
                    value={name}
                    variant="outlined"
                    className="uppercaseInput"
                />

                <TextField
                    fullWidth={true}
                    disabled={true}
                    margin="dense"
                    multiline
                    rows={2}
                    autoComplete="off"
                    label={t('config.unit.note')}
                    value={note || ''}
                    variant="outlined"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={e => {
                        handleCloseViewModal(false);
                        setName('');
                        setNote('')
                    }}
                    variant="contained"
                    disableElevation
                >
                    {t('btn.close')}
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default UnitView