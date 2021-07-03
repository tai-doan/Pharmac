import React from "react";
import T from 'prop-types';
import Grid from '@material-ui/core/Grid';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}));

function BootstrapTooltip(props) {
    const classes = useStylesBootstrap();
    return <Tooltip arrow placement="top" classes={classes} {...props} />;
}

const TextInput = (props) => {
    return (
        <Grid item sm={props.columnswidth} xs={12}>
            <BootstrapTooltip title={props.tooltipContent ? props.t(props.tooltipContent) : props.t(props.label)}>
                <NumberFormat
                    {...props}
                />
            </BootstrapTooltip>
        </Grid>
    )
}

TextInput.propTypes = {
    columnswidth: T.number
}

export default TextInput