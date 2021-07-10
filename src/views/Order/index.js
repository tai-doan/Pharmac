import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Import = lazy(() => import('./Import'))
const InsImport = lazy(() => import('./InsImport'))
const EditImport = lazy(() => import('./EditImport'))
const Export = lazy(() => import('./Export'))
const InsExport = lazy(() => import('./Export/InsExport'))
const EditExport = lazy(() => import('./Export/EditExport'))
const ExportOrder = lazy(() => import('./ExportOrder'))

const ImportInventory = lazy(() => import('./ImportInventory'))
const InsImportInventory = lazy(() => import('./InsImportInventory'))
const EditImportInventory = lazy(() => import('./EditImportInventory'))

const OrderLayout = () => {
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

function Child() {
    let { link, id } = useParams()

    switch (link) {
        case 'import':
            return <Import />
        case 'ins-import':
            return <InsImport />
        case 'edit-import':
            return <EditImport />
        case 'import-inventory':
            return <ImportInventory />
        case 'ins-importInventory':
            return <InsImportInventory />
        case 'edit-importInventory':
            return <EditImportInventory />
        case 'export':
            return <Export />
        case 'ins-export':
            return <InsExport />
        case 'edit-export':
            return <EditExport />
        default:
            break
    }
}

export default OrderLayout