import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official'
import React from 'react';
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const DashboardChart = ({ data }) => {
    const { t } = useTranslation()

    return (
        <div className='w-100 text-center'>
            {data.length > 0 ?
                <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: null,//t('dashboard.revenue_chart'),
                            style: {
                                color: 'var(--TEXT__1)'
                            }
                        },
                        credits: { enabled: false },
                        xAxis: {
                            categories: data.map(x => `${moment(x.o_1, 'YYYYMMDD').format('DD/MM')}`),
                            crosshair: true,
                            lineColor: 'var(--GRID_CHART)',
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: ''
                            },
                            gridLineColor: 'var(--GRID_CHART)',
                            lineColor: 'var(--GRID_CHART)',
                        },
                        tooltip: {
                            headerFormat: `<span style="font-size:10px">${t('date')}: {point.key}</span>`,
                            pointFormat: `<div>${t('dashboard.value_transaction')}: {point.y}</div>`,
                            footerFormat: '',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: [
                            {
                                name: t('dashboard.main_branch'),
                                color: '#007bff',
                                data: data.map(x => Number(x.o_2)),
                            }
                        ]
                    }}
                /> : t('noData')
            }
        </div>
    )
}

export default DashboardChart;
