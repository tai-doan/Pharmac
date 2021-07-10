import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Import = lazy(() => import('./Import'))
const InsImport = lazy(() => import('./Import/InsImport'))
const EditImport = lazy(() => import('./Import/EditImport'))

const Export = lazy(() => import('./Export'))
const InsExport = lazy(() => import('./Export/InsExport'))
const EditExport = lazy(() => import('./Export/EditExport'))

const ExportRepay = lazy(() => import('./ExportRepay'))
const InsExportRepay = lazy(() => import('./ExportRepay/InsExportRepay'))
const EditExportRepay = lazy(() => import('./ExportRepay/EditExportRepay'))

const ExportDestroy = lazy(() => import('./ExportDestroy'))
const InsExportDestroy = lazy(() => import('./ExportDestroy/InsExportDestroy'))
const EditExportDestroy = lazy(() => import('./ExportDestroy/EditExportDestroy'))

const ImportInventory = lazy(() => import('./ImportInventory'))
const InsImportInventory = lazy(() => import('./ImportInventory/InsImportInventory'))
const EditImportInventory = lazy(() => import('./ImportInventory/EditImportInventory'))

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
        case 'export-repay':
            return <ExportRepay />
        case 'ins-exportRepay':
            return <InsExportRepay />
        case 'edit-exportRepay':
            return <EditExportRepay />
        case 'export-destroy':
            return <ExportDestroy />
        case 'ins-exportDestroy':
            return <InsExportDestroy />
        case 'edit-exportDestroy':
            return <EditExportDestroy />
        default:
            break
    }
}

export default OrderLayout