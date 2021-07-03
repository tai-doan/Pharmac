import React from "react";
import T from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';


const SelectInput = (props) => {
    return (
        <Grid item sm={props.columnswidth} xs={12}>
            <TextField
                select
                {...props}
            >
            {props.children}
            </TextField>
        </Grid>
    )
}

SelectInput.propTypes = {
    columnswidth: T.number
}

export default SelectInput