import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { useHotkeys } from 'react-hotkeys-hook'

const UnitAdd = ({ id, Bname, Bnote, shouldOpenModal, handleCloseAddModal, unitNameFocus, unitNoteFocus, handleSubmit }) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')

    useHotkeys('f3', () => handleSubmit(false, name, note), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleSubmit(true, name, note), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => handleCloseAddModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        setName(Bname)
        setNote(Bnote)
    }, [Bname, Bnote])

    const checkValidate = () => {
        if (!!name) {
            return false
        }
        return true
    }

    const handleChangeName = e => {
        setName(e.target.value);
    }

    const handleChangeNote = e => {
        setNote(e.target.value);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={shouldOpenModal}
            onClose={e => {
                handleCloseAddModal(false)
                setNote('')
                setName('')
            }}
        >
            <Card>
                <CardHeader title={t(id === 0 ? 'config.unit.titleAdd' : 'config.unit.titleEdit', { name: name })} />
                <CardContent>
                    <TextField
                        fullWidth={true}
                        required
                        autoFocus
                        inputRef={unitNameFocus}
                        autoComplete="off"
                        margin="dense"
                        label={t('config.unit.name')}
                        onChange={handleChangeName}
                        value={name}
                        variant="outlined"
                        className="uppercaseInput"
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                handleSubmit(false, name, note)
                                setName('')
                                setNote('')
                            }
                        }}
                    />

                    <TextField
                        fullWidth={true}
                        margin="dense"
                        multiline
                        rows={2}
                        inputRef={unitNoteFocus}
                        autoComplete="off"
                        label={t('config.unit.note')}
                        onChange={handleChangeNote}
                        value={note || ''}
                        variant="outlined"
                    />
                </CardContent>
                <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                    <Button size='small'
                        onClick={e => {
                            handleCloseAddModal(false);
                            setName('');
                            setNote('')
                        }}
                        variant="contained"
                        disableElevation
                    >
                        {t('btn.close')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleSubmit(false, name, note);
                            setName('');
                            setNote('')
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    {(!id || id === 0) && (
                        <Button size='small'
                            onClick={() => {
                                handleSubmit(true, name, note);
                                setName('');
                                setNote('')
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={checkValidate() === false ? 'bg-success text-white' : ''}
                        >
                            {t('config.save_continue')}
                        </Button>
                    )}
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default UnitAdd