import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Import = lazy(() => import('./Import'))
const ImportInventory = lazy(() => import('./ImportInventory'))
const Export = lazy(() => import('./Export'))
const ExportRepay = lazy(() => import('./ExportRepay'))
const ExportDestroy = lazy(() => import('./ExportDestroy'))
const ImportPayment = lazy(() => import('./ImportPayment'))
const CollectSales = lazy(() => import('./CollectSales'))
const CollectReturns = lazy(() => import('./CollectReturn'))
const Inventory = lazy(() => import('./Inventory'))
const TransactionStatement = lazy(() => import('./TransactionStatement'))

const ReportLayout = () => {
    return (
        <>
            <Switch>
                <Route path="/page/report/:link" children={<Child />} />
                <Redirect to={{ pathname: './report/import', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

function Child() {
    let { link } = useParams()

    switch (link) {
        case 'import':
            return <Import />
        case 'import-inventory':
            return <ImportInventory />
        case 'export':
            return <Export />
        case 'export-repay':
            return <ExportRepay />
        case 'export-destroy':
            return <ExportDestroy />
        case 'import-payment':
            return <ImportPayment />
        case 'collect-sales':
            return <CollectSales />
        case 'collect-returns':
            return <CollectReturns />
        case 'inventory':
            return <Inventory />
        case 'transaction-statement':
            return <TransactionStatement />
        default:
            break
    }
}

export default ReportLayout
