import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../components/Bill/initPharmacyInfo.modal'

const CustomTooltip = ({ active, payload, label }) => {
    const { t } = useTranslation()
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
                <p className="label">{t('date')}: {label}</p>
                <p className="intro">{t('dashboard.value_transaction')}: {formatCurrency(payload[0].value)}</p>
            </div>
        );
    }

    return null;
};

const DashboardChart = ({ data }) => {
    const { t } = useTranslation()
    const [dataChart, setDataChart] = useState([])
    const contentRef = useRef(null)

    useEffect(() => {
        let dataConvert = data.reverse().map(x => { return { 'date': moment(x.o_1, 'YYYYMMDD').format('DD/MM'), 'value': x.o_2 } })
        let newData = Object.assign([], dataConvert)
        setDataChart(newData)
    }, [data])

    return (
        <div ref={contentRef} className='w-100 text-center'>
            {dataChart.length > 0 ?
                <BarChart
                    width={contentRef.current.clientWidth}
                    height={600}
                    data={dataChart}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis dataKey="value" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
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
