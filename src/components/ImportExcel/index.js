import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next'
import { Button, Dialog, Alert, CardHeader, CardContent, Card, CardActions, Input } from '@material-ui/core';

const ImportExcel = ({ title, onChange }) => {
    const { t } = useTranslation()

    const [shouldOpenModal, setShouldOpenModal] = useState(false);
    const [dataSource, setDataSource] = useState([])
    const [isError, setIsError] = useState(false)
    const allowFileTypes = useRef([
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ])

    const handleShowModal = () => {
        setDataSource([]);
        setShouldOpenModal(true)
    }

    const handleCloseModal = () => {
        setDataSource([]);
        setShouldOpenModal(false)
    }

    const handleOk = e => {
        e.preventDefault();
        if (!!isError) {
            return;
        }

        onChange(dataSource);
        handleCloseModal();
    };

    const validateFile = value => {
        const flag = allowFileTypes.current.indexOf(value.type);
        if (flag === -1) {
            return false;
        }
        return true;
    };

    const getDataBeginRow = (file, beginRow) => {
        let data = [];
        const fileReader = new FileReader();
        fileReader.onload = event => {
            try {
                const { result } = event.target;
                const workbook = XLSX.read(result, { type: 'binary' });
                const sheetNameList = workbook.SheetNames;
                sheetNameList.forEach(function (y) {
                    const workSheet = workbook.Sheets[y];
                    const headers = {};
                    for (const w in workSheet) {
                        if (w[0] === '!') continue;
                        //parse out the column, row, and value
                        const row = parseInt(w.substring(1));
                        if (row == beginRow - 1) {
                            continue;
                        }
                        const col = w.substring(0, 1);
                        const value = workSheet[w].v;
                        //store header names
                        if (row === beginRow) {
                            headers[col] = value;
                            continue;
                        }
                        if (!data[row - 1]) {
                            data[row - 1] = {};
                        }
                        data[row - 1][headers[col]] = value;
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();
                    console.log('data: ', data);
                });
            } catch (e) {
                console.warn('có lỗi tại getDataBeginRow: ', e)
            }
        };
        fileReader.readAsBinaryString(file);
        setDataSource([...data])
    };

    const getData = file => {
        const fileReader = new FileReader();
        fileReader.onload = event => {
            try {
                const data = [];
                const { result } = event.target;
                const workbook = XLSX.read(result, { type: 'binary' });
                for (const Sheet in workbook.Sheets) {
                    if (workbook.Sheets.hasOwnProperty(Sheet)) {
                        const rs = XLSX.utils.sheet_to_json(workbook.Sheets[Sheet]);
                        data.push(rs);
                    }
                }
                setDataSource(data[0])
            } catch (e) {
                console.warn('có lỗi tại getData: ', e)
            }
        };
        fileReader.readAsBinaryString(file);
    };

    const handleImportChange = e => {
        setDataSource([])
        const { files } = e.target;
        if (files.length === 1) {
            // Process a file if we have exactly one
            if (validateFile(files[0]) === true) {
                getDataBeginRow(files[0], 2);
                setIsError(false);
            } else {
                setIsError(true);
            }

        }
    };

    return (
        <>
            <Button type='primary' onClick={handleShowModal}> {t('import')}</Button>
            <Dialog
                maxWidth='sm'
                open={shouldOpenModal}
                onClose={handleCloseModal}
            >
                <Card>
                    <CardHeader title={title ? title : t('import')} />
                    <CardContent>
                        {isError &&
                            <Alert
                                message={t('error_file')}
                                type='error'
                                closable
                                onClose={() => { }}
                            />
                        }
                        <br />
                        <Input style={{ padding: 1 }} type='file' accept='.xlsx, .xls, .csv' onChange={handleImportChange} />
                    </CardContent>
                    <CardActions className='align-items-end' style={{ justifyContent: 'flex-end' }}>
                        <Button key='submit' type='primary' onClick={handleOk}>
                            {t('save')}
                        </Button>,
                        <Button key='back' type='primary' onClick={handleCloseModal}>
                            {t('cancel')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default ImportExcel;
