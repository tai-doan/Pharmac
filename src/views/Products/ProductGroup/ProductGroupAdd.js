import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, CardActions, Button, TextField, Dialog } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

const ProductGroupAdd = ({ id, Bname, Bnote, shouldOpenModal, handleCloseAddModal, productGroupNameFocus, productGroupNoteFocus, handleCreate }) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')

    useHotkeys('f3', () => handleCreate(false, name, note), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(true, name, note), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('esc', () => handleCloseAddModal(false), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        return () => {
            setName('')
            setNote('')
        }
    }, [])

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
                <CardHeader title={t('products.productGroup.titleAdd')} />
                <CardContent>
                    <TextField
                        fullWidth={true}
                        required
                        autoFocus
                        inputRef={productGroupNameFocus}
                        autoComplete="off"
                        margin="dense"
                        label={t('products.productGroup.name')}
                        onChange={handleChangeName}
                        value={name}
                        variant="outlined"
                        className="uppercaseInput"
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                handleCreate(false, name, note)
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
                        inputRef={productGroupNoteFocus}
                        autoComplete="off"
                        label={t('products.productGroup.note')}
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
                            handleCreate(false, name, note);
                            setName('');
                            setNote('')
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('btn.save')}
                    </Button>
                    <Button size='small'
                        onClick={() => {
                            handleCreate(true, name, note);
                            setName('');
                            setNote('')
                        }}
                        variant="contained"
                        disabled={checkValidate()}
                        className={checkValidate() === false ? 'bg-success text-white' : ''}
                    >
                        {t('save_continue')}
                    </Button>
                </CardActions>
            </Card>
        </Dialog >
    )
}

export default ProductGroupAdd