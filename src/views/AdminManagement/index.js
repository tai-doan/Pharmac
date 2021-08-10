import React, { lazy } from 'react'
import { Switch, Route, Redirect, useParams } from 'react-router-dom'

const User = lazy(() => import('./User'))
const Permission = lazy(() => import('./Permission'))
const LockOrder = lazy(() => import('./LockOrder'))
const Pharmacy = lazy(() => import('./Pharmacy'))
const UserInfo = lazy(() => import('./User/UserInfo'))

const AdminManagementLayout = () => {
    return (
        <>
            <Switch>
                <Route path="/page/management/:link" children={<Child />} />
                <Redirect to={{ pathname: './management/user', state: { from: '/' } }} />
            </Switch>
        </>
    )
}

function Child() {
    let { link } = useParams()

    switch (link) {
        case 'pharmacy':
            return <Pharmacy />
        case 'user':
            return <User />
        case 'user-info':
            return <UserInfo />
        case 'permission':
            return <Permission />
        case 'lock-order':
            return <LockOrder />
        default:
            break
    }
}

export default AdminManagementLayout