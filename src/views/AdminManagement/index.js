import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const User = lazy(() => import('./User'))
const Permission = lazy(() => import('./Permission'))

const AdminManagementLayout = () => {
    return (
        <>
            <Switch>
                <Route path="/page/management/:link" children={<Child />} />
                <Redirect to={{ pathname: './user', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

function Child() {
    let { link } = useParams()

    switch (link) {
        case 'pharmacy':
            return null
        case 'user':
            return <User />
        case 'permission':
            return <Permission />
        case 'lock-order':
            return null
        case 'lock-product':
            return null
        default:
            break
    }
}

export default AdminManagementLayout