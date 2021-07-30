import React from 'react'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { Tooltip, Chip } from '@material-ui/core';
import { ReactComponent as IC_EXCEL } from '../../asset/images/excel.svg'

const ExportExcel = ({ filename = '', data = [], headers = [], styleSvg = {}, ...props }) => {
    const { t } = useTranslation()
    return <CSVLink filename={filename + '.csv'} data={data} headers={headers} target="_blank">
        <Tooltip title={t('exportExcel')} className="tooltip-override">
            <Chip {...props} size="small" className='mr-1'
                deleteIcon={<IC_EXCEL />}
                onDelete={() => null}
                label={t('exportExcel')}
            />
        </Tooltip>
    </CSVLink>
}

export default ExportExcel
