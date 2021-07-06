import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const ImportOrder = lazy(() => import('./ImportOrder'))
const Import = lazy(() => import('./Import'))
const InsImport = lazy(() => import('./InsImport'))
const ExportOrder = lazy(() => import('./ExportOrder'))
const InsExport = lazy(() => import('./InsExport'))
// const Price = lazy(() => import('./Price/index'))
// const StoreLimit = lazy(() => import('./StoreLimit'))
// const WarnTime = lazy(() => import('./WarnTime'))

const ReportView = () => {
    return (
        <>
            <Switch>
                <Route path="/page/order/:link/:id" children={<Child />} />
                <Route path="/page/order/:link" children={<Child />} />
                <Redirect to={{ pathname: './order/import', state: { from: '/' } }} />
            </Switch>
        </>
    )
}
ReportView.propTypes = {}

function Child() {
    let { link, id } = useParams()

    switch (link) {
        case 'import':
            return <Import />
        case 'ins-import':
            return <InsImport id={id || 0}/>
        case 'export':
            return <ExportOrder />
        case 'ins-export':
            return <InsExport id={id || 0}/>
        default:
            break
    }
}

export default ReportView
