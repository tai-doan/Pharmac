import React from 'react'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { SvgIcon, Tooltip, Chip } from '@material-ui/core';

const ExportExcel = ({ filename = '', data = [], headers = [], styleSvg = {}, ...props }) => {
    const { t } = useTranslation()
    return <CSVLink filename={filename + '.csv'} data={data} headers={headers} target="_blank">
        <Tooltip title={t('exportExcel')} className="tooltip-override">
            <Chip {...props} size="small" className='mr-1'
                deleteIcon={
                    <SvgIcon viewBox="0 0 24 24" style={{ color: '#fff' }}>
                        <path d="M 6 2 C 4.9 2 4 2.9 4 4 L 4 20 C 4 21.1 4.9 22 6 22 L 14.171875 22 L 13.292969 21.121094 C 13.104969 20.934094 13 20.679062 13 20.414062 L 13 19 C 13 18.448 13.448 18 14 18 L 16 18 L 16 15 C 16 14.448 16.448 14 17 14 L 20 14 L 20 8 L 14 2 L 6 2 z M 13 3.5 L 18.5 9 L 13 9 L 13 3.5 z M 9.1757812 10 L 10.953125 10 L 11.876953 12.214844 C 11.950953 12.395844 12.008406 12.60575 12.066406 12.84375 L 12.091797 12.84375 C 12.125797 12.70175 12.192969 12.481266 12.292969 12.197266 L 13.322266 10 L 14.943359 10 L 13.005859 13.669922 L 14.783203 17 L 13.085938 17 L 12.158203 14.990234 C 12.116203 14.905234 12.066391 14.736047 12.025391 14.498047 L 12.009766 14.498047 C 11.984766 14.612047 11.934375 14.782719 11.859375 15.011719 L 10.736328 17.40625 L 9 17.40625 L 11.060547 13.697266 L 9.1757812 10 z M 18 16 L 18 20 L 15 20 L 19 24 L 23 20 L 20 20 L 20 16 L 18 16 z"></path>
                    </SvgIcon>}
                onDelete={() => null}
                label={t('exportExcel')}
            />
        </Tooltip>
    </CSVLink>
}

export default ExportExcel
