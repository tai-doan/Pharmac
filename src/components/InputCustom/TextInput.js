import React from "react";
import T from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';


const TextInput = (props) => {
    return (
        <Grid item sm={props.columnswidth} xs={12}>
            <TextField
                {...props}
            />
        </Grid>
    )
}

TextInput.propTypes = {
    columnswidth: T.number
}

export default TextInput