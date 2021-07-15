import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Import = lazy(() => import('./Import'))

const SettlementLayout = () => {
    return (
        <>
            <Switch>
                <Route path="/page/settlement/:link/:id" children={<Child />} />
                <Route path="/page/settlement/:link" children={<Child />} />
                <Redirect to={{ pathname: './settlement/import', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

function Child() {
    let { link, id } = useParams()

    switch (link) {
        case 'import':
            return <Import />
        // case 'supplier':
        //     return <Suppliers />
        default:
            break
    }
}

export default SettlementLayout
