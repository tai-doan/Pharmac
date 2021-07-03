import {
    compose,
    lifecycle
} from "recompose";

import OrderView from "./OrderView";

const enhance = compose(
    lifecycle({
        componentDidMount() {
        },
        componentWillUnmount() {
        }
    })
);

export default enhance(OrderView);
