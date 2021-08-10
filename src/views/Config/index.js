import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const Unit = lazy(() => import('./Unit'))
const UnitRate = lazy(() => import('./UnitRate'))
const Price = lazy(() => import('./Price/index'))
const StoreLimit = lazy(() => import('./StoreLimit'))
const WarnTime = lazy(() => import('./WarnTime'))

const configLayout = () => {
    return (
        <>
            <Switch>
                <Route path="/page/config/:link" children={<Child />} />
                <Redirect to={{ pathname: './config/unit', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

function Child() {
    let { link } = useParams()

    switch (link) {
        case 'unit':
            return <Unit />
        case 'unit-rate':
            return <UnitRate />
        case 'price':
            return <Price />
        case 'store-limit':
            return <StoreLimit />
        case 'warn-time':
            return <WarnTime />
        default:
            break
    }
}

export default configLayout
