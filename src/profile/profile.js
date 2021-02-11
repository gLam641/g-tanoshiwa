import { default as React, useEffect } from 'react';
import { useState } from 'react';
import { Grid, Button, FormControlLabel } from '@material-ui/core';
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
import Checkbox from '@material-ui/core/Checkbox';

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
    NewPasswordClass: {
        marginLeft: '8px',
        display: 'block'
    },
    submitClass: {
        marginTop: '1em',
        marginLeft: '8px'
    }
}));

/* 
 *  Mutable fields
 *  name
 *  password -> new password x 2
 *  profileImage
 *  
*/
export default function Profile({ user = null, setUser = null }) {
    const history = useHistory();

    useEffect(() => {
        if (!user) history.push('/login');
    }, [user, history]);

    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isNewPassword, setIsNewPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newPassword2, setNewPassword2] = useState("");
    const [showNewPassword2, setShowNewPassword2] = useState(false);
    const [image, setImage] = useState("");

    const classes = useStyles();

    const onFieldChange = (ev, setField) => {
        const newFieldVal = ev.target.value;
        if (newFieldVal && newFieldVal !== "") {
            setField(newFieldVal);
        } else {
            setField("");
        }
    };

    const isNewPasswordValid = () => {
        if (!isNewPassword) return true;

        return newPassword && newPassword !== "" &&
            newPassword2 && newPassword2 !== "" &&
            newPassword === newPassword2;
    };

    const isFormValid = () => {
        return password && password !== "" && isNewPasswordValid();
    };

    const onSubmit = (ev) => {
        ev.preventDefault();

        if (isFormValid()) {
            let body = {
                name,
                image,
                password
            };

            if (isNewPassword) {
                body = Object.assign(body, {
                    newPassword,
                    newPassword2
                });
            }

            axios.post('http://localhost:5000/user', body).then((resp) => {
                if (resp.status === 200) {
                    setSnackBarMessage(`Your profile has been updated successfully!`);
                    setSnackBarSeverity("success");
                    setUser(resp.data.user);
                    setTimeout(() => {
                        history.push('/');
                    }, 1000);
                }
            }).catch((err) => {
                setSnackBarMessage(`Profile update failed: ${err.response.data.msg.message}`);
                setSnackBarSeverity("error");
            });
        } else {
            setSnackBarMessage("Please fill in the missing required fields.");
            setSnackBarSeverity("warning");
        }
    };

    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarMessage("");
    };

    // Get user profile info from server
    useEffect(() => {
        if (user) {
            axios.get('http://localhost:5000/user')
                .then((resp) => {
                    if (resp.status === 200) {
                        setName(resp.data.name);
                        setImage(resp.data.profileImage);
                    }
                }).catch((err) => {
                    setSnackBarMessage(`Failed to get user info from server: ${err.response.data.msg.message}`);
                    setSnackBarSeverity("error");
                });
        }
    }, [user]);

    return (
        <Grid container className={classes.root} >
            <Snackbar open={snackBarMessage !== ""} autoHideDuration={6000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
            <Grid item xs={12}>
                <Typography variant="h1">Profile</Typography>
            </Grid>
            <Grid container item justify="center">
                <form
                    className={classes.formClass} noValidate autoComplete="off">
                    <div>
                        <TextField
                            id="name"
                            label="Name"
                            error={!name}
                            value={name}
                            onChange={(ev) => { onFieldChange(ev, setName) }}
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
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            required
                        />
                        {
                            isNewPassword ?
                                <>
                                    <TextField
                                        id="newPassword"
                                        label="NewPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        error={!newPassword}
                                        onChange={(ev) => { onFieldChange(ev, setNewPassword) }}
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        required
                                    />
                                    <TextField
                                        id="newPassword2"
                                        label="NewPassword2"
                                        type={showNewPassword2 ? 'text' : 'password'}
                                        error={!newPassword2}
                                        onChange={(ev) => { onFieldChange(ev, setNewPassword2) }}
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowNewPassword2(!showNewPassword2)}
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        required
                                    />
                                </> :
                                <></>
                        }
                        <FormControlLabel
                            className={classes.NewPasswordClass}
                            control={
                                <Checkbox
                                    checked={isNewPassword}
                                    onChange={(ev) => { setIsNewPassword(!isNewPassword) }}
                                    name="isNewPassword"
                                    color="primary"
                                />}
                            label="Set new Password"
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
        </Grid >
    );
};