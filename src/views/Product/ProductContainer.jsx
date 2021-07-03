import {
    compose,
    lifecycle
} from "recompose";

import ProductView from "./ProductView";

const enhance = compose(
    lifecycle({
        componentDidMount() {
        },
        componentWillUnmount() {
        }
    })
);

export default enhance(ProductView);
