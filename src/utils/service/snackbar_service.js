import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
// import { SnackbarProvider, useSnackbar } from 'notistack';
import ReactDOM from 'react-dom'
import MuiAlert from '@material-ui/lab/Alert'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />
}

class SnackBarService {
    open = false
    severity = ''
    message = 'info'
    time = 3000

    alert = (message, open, severity, time) => {
        this.open = open
        this.message = message
        this.time = time
        switch (severity) {
            case 0:
                this.severity = 'info'
                break
            case 1:
                this.severity = 'success'
                break
            case 2:
                this.severity = 'error'
                break
            case 4:
                this.severity = 'warning'
                break
            default:
                break
        }
        this.render()
    }
    handleClose = () => {
        this.open = false

        this.render()
    }

    render() {
        ReactDOM.render(
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                key="{'top', 'right'}"
                open={this.open}
                autoHideDuration={this.time}
                onClose={this.handleClose}
            >
                <Alert onClose={this.handleClose} severity={this.severity}>
                    {this.message}
                </Alert>
            </Snackbar>,
            document.getElementById('snackbar')
        )
    }
}
const theInstance = new SnackBarService()

export default theInstance
