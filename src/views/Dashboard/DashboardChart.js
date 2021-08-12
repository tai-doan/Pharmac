import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import { formatCurrency } from '../../components/Bill/initPharmacyInfo.modal'

const DashboardChart = ({ data }) => {
    const { t } = useTranslation()
    const [dataChart, setDataChart] = useState([])
    const contentRef = useRef(null)

    useEffect(() => {
        let dataConvert = data.reverse().map(x => { return { 'date': moment(x.o_1, 'YYYYMMDD').format('DD/MM'), 'value': x.o_2 } })
        let newData = Object.assign([], dataConvert)
        setDataChart(newData)
    }, [data])

    const cols = {
        value: {
            // tickInterval: 100000,
            base: 10
        },
    }

    return (
        <div ref={contentRef} className='w-100 text-center'>
            {dataChart.length > 0 ?
                <Chart padding='auto' scale={cols} style={{ margin: '1rem' }} data={dataChart} height={600} autoFit={true} forceFit={true}>
                    <Legend />
                    <Axis name='date' />
                    <Axis name='value' label={{
                        formatter(text, item, index) {
                            return formatCurrency(text)
                        }
                    }} />
                    <Tooltip crosshairs={{ type: 'y' }} />
                    <Geom type='interval' position='date*value' color='#3ba1ff' adjust={[{ type: 'dodge', marginRatio: 1 / 32 }]} tooltip={['date*value', (date, value) => {
                        return {
                            name: t('dashboard.revenue'),
                            title: `${t('date')}: ` + date,
                            value: formatCurrency(value) + t('currency')
                        };
                    }]} />
                </Chart>
                : t('noData')
            }
        </div >
    )
}

export default DashboardChart;
