import {
    compose,
    lifecycle
} from "recompose";

import ReportView from "./ReportView";

const enhance = compose(
    lifecycle({
        componentDidMount() {
        },
        componentWillUnmount() {
        }
    })
);

export default enhance(ReportView);
