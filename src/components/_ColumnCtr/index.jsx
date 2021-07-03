import { compose, withHandlers, hoistStatics } from 'recompose'

import ColumnCtrView from './ColumnCtrView'

const enhance = compose(
    withHandlers({
        handleCheckChange: props => item => {
            props.checkColumnChange && props.checkColumnChange(item)
        },
    })
)

export default hoistStatics(enhance)(ColumnCtrView)
