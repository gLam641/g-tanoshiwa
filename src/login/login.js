import React from 'react';
import { useState } from 'react';
import { Grid, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

axios.defaults.withCredentials = true;

const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(4),
    },
    formClass: {
        padding: theme.spacing(4),
        width: "100%",
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: "100%",
        },
    },
    submitClass: {
        marginTop: '2em',
        marginLeft: '8px'
    }
}));

export default function Login({ setUser }) {
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const classes = useStyles();
    const history = useHistory();

    const onFieldChange = (ev, setField) => {
        const newFieldVal = ev.target.value;
        if (newFieldVal && newFieldVal !== "") {
            setField(newFieldVal);
        } else {
            setField("");
        }
    };

    const isFormValid = () => {
        return email && email !== "" &&
            password && password !== "";
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const onSubmit = (ev) => {
        ev.preventDefault();

        if (isFormValid()) {
            axios.post('http://localhost:5000/user/login', {
                email,
                password
            }).then((resp) => {
                if (resp.status === 200) {
                    setSnackBarMessage(`You have successfully logged in!`);
                    setSnackBarSeverity("success");
                    setUser(resp.data.user);
                    setTimeout(() => {
                        history.push('/');
                    }, 1000);
                }
            }).catch((err) => {
                setSnackBarMessage(`Login failed: ${err.response.data.msg.message}`);
                setSnackBarSeverity("error");
            });
        } else {
            setSnackBarMessage("Please fill in the missing fields.");
            setSnackBarSeverity("warning");
        }
    };

    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarMessage("");
    };

    return (
        <Grid container className={classes.root}>
            <Snackbar open={snackBarMessage !== ""} autoHideDuration={6000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
            <Grid item xs={12}>
                <Typography variant="h1">Login</Typography>
            </Grid>
            <Grid container item justify="center">
                <form
                    className={classes.formClass} noValidate autoComplete="off">
                    <div>
                        <TextField
                            id="email"
                            label="Email"
                            error={!email}
                            onChange={(ev) => { onFieldChange(ev, setEmail) }}
                            variant="outlined"
                            required
                        />
                        <TextField
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            error={!password}
                            onChange={(ev) => { onFieldChange(ev, setPassword) }}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            required
                        />
                        <Button
                            className={classes.submitClass}
                            color="primary"
                            variant="contained"
                            type="submit"
                            onClick={onSubmit}
                        >Submit</Button>
                    </div>
                </form>
            </Grid>
        </Grid>
    );
};