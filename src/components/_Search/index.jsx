import { compose, withHandlers, withState, hoistStatics } from 'recompose'

import SearchView from './SearchView'
let searchTimeOut
const enhance = compose(
    withState('searchStr', 'setSearchVal', ''),

    withHandlers({
        onSearchChange: props => el => {
            let value = el.target.value
            props.setSearchVal && props.setSearchVal(el.target.value)
            if (searchTimeOut) clearTimeout(searchTimeOut)
            searchTimeOut = setTimeout(() => {
                props.searchSubmit(value)
            }, 1500)
        },
        onClickSearch: props => event => {
            event.preventDefault()
            if (searchTimeOut) clearTimeout(searchTimeOut)
            props.searchSubmit && props.searchSubmit(props.searchStr)
        },
    })
)

export default hoistStatics(enhance)(SearchView)
