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
                    <Axis name='value' />
                    <Tooltip crosshairs={{ type: 'y' }} />
                    <Geom type='interval' position='date*value' adjust={[{ type: 'dodge', marginRatio: 1 / 32 }]} tooltip={['date*value', (date, value) => {
                        return {
                            name: t('dashboard.revenue'),
                            title: `${t('date')}: ` + date,
                            value: formatCurrency(value) + t('currency')
                        };
                    }]} />
                </Chart>
                // <HighchartsReact
                //     highcharts={Highcharts}
                //     options={{
                //         chart: {
                //             type: 'column'
                //         },
                //         title: {
                //             text: null,//t('dashboard.revenue_chart'),
                //             style: {
                //                 color: 'var(--TEXT__1)'
                //             }
                //         },
                //         credits: { enabled: false },
                //         xAxis: {
                //             categories: data.reverse().map(x => `${moment(x.o_1, 'YYYYMMDD').format('DD/MM')}`),
                //             crosshair: true,
                //             lineColor: 'var(--GRID_CHART)',
                //         },
                //         yAxis: {
                //             min: 0,
                //             title: {
                //                 text: ''
                //             },
                //             gridLineColor: 'var(--GRID_CHART)',
                //             lineColor: 'var(--GRID_CHART)',
                //         },
                //         tooltip: {
                //             headerFormat: `<span style="font-size:10px">${t('date')}: {point.key}</span>`,
                //             pointFormat: `<div>${t('dashboard.value_transaction')}: {point.y}</div>`,
                //             footerFormat: '',
                //             shared: true,
                //             useHTML: true
                //         },
                //         plotOptions: {
                //             column: {
                //                 pointPadding: 0.2,
                //                 borderWidth: 0
                //             }
                //         },
                //         series: [
                //             {
                //                 name: t('dashboard.main_branch'),
                //                 color: '#007bff',
                //                 data: data.reverse().map(x => Number(x.o_2)),
                //             }
                //         ]
                //     }}
                // /> 
                : t('noData')
            }
        </div >
    )
}

export default DashboardChart;
