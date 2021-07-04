import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Customer = lazy(() => import('./Customer'))
const CustomerClone = lazy(() => import('./CustomerClone'))
const InsCus = lazy(() => import('./InsCus'))
const Suppliers = lazy(() => import('./Suppliers'))
const InsSup = lazy(() => import('./InsSup'))
// const Price = lazy(() => import('./Price/index'))
// const StoreLimit = lazy(() => import('./StoreLimit'))
// const WarnTime = lazy(() => import('./WarnTime'))

const PartnerView = () => {
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
PartnerView.propTypes = {}

function Child() {
    let { link, id } = useParams()

    switch (link) {
        case 'customer':
            return <CustomerClone />
        case 'ins-customer':
            return <InsCus id={id || 0}/>
        case 'supplier':
            return <Suppliers />
        case 'ins-supplier':
            return <InsSup id={id || 0} />
        default:
            break
    }
}

export default PartnerView
