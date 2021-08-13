import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const ProductGroup = lazy(() => import('./ProductGroup'))
const Product = lazy(() => import('./Product'))

function Child() {
    let { link } = useParams()
    switch (link) {
        case 'product-group':
            return <ProductGroup />
        case 'product':
            return <Product />
        default:
            break
    }
}

const Products = () => {
    return (
        <>
            <Switch>
                <Route path="/page/products/:link" children={<Child />} />
                <Redirect to={{ pathname: './products/product', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

export default Products
