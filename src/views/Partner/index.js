import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Customer = lazy(() => import('./Customer'))
const Suppliers = lazy(() => import('./Supplier'))

const PartnerLayout = () => {
    return (
        <>
            <Switch>
                <Route path="/page/partner/:link/:id" children={<Child />} />
                <Route path="/page/partner/:link" children={<Child />} />
                <Redirect to={{ pathname: './partner/customer', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

function Child() {
    let { link, id } = useParams()

    switch (link) {
        case 'customer':
            return <Customer />
        case 'supplier':
            return <Suppliers />
        default:
            break
    }
}

export default PartnerLayout
