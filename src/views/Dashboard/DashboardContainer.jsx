import {
    compose,
    // withHandlers,
    // withState,
    // withProps,
    // defaultProps,
    // hoistStatics,
    lifecycle
} from "recompose";

import DashboardView from "./DashboardView";

const enhance = compose(

    // lifecycle({
    //     componentDidMount() {
    //     },
    //     componentWillUnmount() {
    //     }
    // })
);

export default enhance(DashboardView);
