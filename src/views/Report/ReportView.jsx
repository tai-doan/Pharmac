import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const WarnExp = lazy(() => import('./WarnExp'))
const Inventory = lazy(() => import('./Inventory'))
const WarnInventory = lazy(() => import('./WarnInventory'))
const ImportOrder = lazy(() => import('./Import'))
const ExportOrder = lazy(() => import('./Export'))

const ReportView = () => {
    return (
        <>
            <Switch>
                <Route path="/page/report/:link" children={<Child />} />
                <Redirect to={{ pathname: './report/warn-exp', state: { from: '/' } }} />
            </Switch>
        </>
    )
}
ReportView.propTypes = {}

function Child() {
    let { link } = useParams()

    switch (link) {
        case 'warn-exp':
            return <WarnExp />
        case 'inventory':
            return <Inventory />
        case 'store-limit':
            return <WarnInventory />
        case 'import-order':
            return <ImportOrder />
        case 'export-order':
            return <ExportOrder />
        default:
            break
    }
}

export default ReportView
