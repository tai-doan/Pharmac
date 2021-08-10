import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const ProductGroup = lazy(() => import('./ProductGroup'))
const Product = lazy(() => import('./Product'))
// const UnitRate = lazy(() => import('./UnitRate'))
// const Price = lazy(() => import('./Price/index'))
// const StoreLimit = lazy(() => import('./StoreLimit'))
// const WarnTime = lazy(() => import('./WarnTime'))

function Child() {
    let { link } = useParams()
    switch (link) {
        case 'product-group':
            return <ProductGroup />
        case 'product':
            return <Product />
        // case 'unit-rate':
        //     return <UnitRate />
        // case 'price':
        //     return <Price />
        // case 'store-limit':
        //     return <StoreLimit />
        // case 'warn-time':
        //     return <WarnTime />
        default:
            break
    }
}

const Products = () => {
    return (
        <>
            <Switch>
                <Route path="/page/products/:link" children={<Child />} />
                <Redirect to={{ pathname: './products/product-group', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

export default Products
