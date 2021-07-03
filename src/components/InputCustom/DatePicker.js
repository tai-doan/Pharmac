import React from "react";
import T from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';


//Example props
{/* <KeyboardDatePicker
    disableToolbar
    variant="inline"
    format="MM/dd/yyyy"
    margin="normal"
    id="date-picker-inline"
    label="Date picker inline"
    value={selectedDate}
    onChange={handleDateChange}
    KeyboardButtonProps={{
        'aria-label': 'change date',
    }}
/> */}


const DatePicker = (props) => {
    return (
        <Grid item sm={props.columnswidth} xs={12}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    {...props}
                />
            </MuiPickersUtilsProvider>      
        </Grid>
    )
}

DatePicker.propTypes = {
    columnswidth: T.number
}

export default DatePicker