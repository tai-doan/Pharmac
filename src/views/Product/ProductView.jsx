import React, { lazy } from "react";
import { Switch, Route, Redirect, useParams } from "react-router-dom";

const Getlist = lazy(() => import('./Getlist/index'));
const Ins = lazy(() => import('./Ins/index'));

const ProductView = (props) => {

    return (
        <>
            <Switch>
                <Route path="/page/product/:link/:id" children={<Child />} />
                <Route path="/page/product/:link" children={<Child />} />
                <Redirect to={{ pathname: "./product/get-list", state: { from: '/' } }} />
            </Switch>
        </>
    )
}

ProductView.propTypes = {
}

function Child() {

    let { link, id } = useParams();

    switch (link) {
        case 'get-list':
            return <Getlist />;
        case 'ins':
            return <Ins id={id || 0} />;
            default:
                break;
    }
}

export default ProductView;
