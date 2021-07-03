import {
    compose,
    lifecycle
} from "recompose";

import PartnerView from "./PartnerView";

const enhance = compose(
    lifecycle({
        componentDidMount() {
        },
        componentWillUnmount() {
        }
    })
);

export default enhance(PartnerView);
