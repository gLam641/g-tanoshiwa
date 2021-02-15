import { useState, useEffect } from 'react';
import { Grid, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { serverEndPoint } from '../config.js';

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
    imageUploadClass: {
        marginTop: '1em',
        marginLeft: '8px',
        display: 'inline-block'
    },
    submitClass: {
        marginTop: '2em',
        marginLeft: '8px',
        display: 'block'
    },
    input: {
        display: 'none'
    }
}));

export default function Register({ setUser }) {
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [passwordHelper, setPasswordHelper] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
    const [confirmPasswordHelper, setConfirmPasswordHelper] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [image, setImage] = useState("");

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

    useEffect(() => {
        setPasswordHelper("");
        setConfirmPasswordHelper("");
        if ((!password || password === "") &&
            (!confirmPassword || confirmPassword === "")) {
            setIsPasswordValid(false);
            setIsConfirmPasswordValid(false);
        } else if (password.length < 6 || confirmPassword.length < 6) {
            if (password.length < 6) {
                setIsPasswordValid(false);
                setPasswordHelper("Password must have at least 6 characters");
            }
            if (confirmPassword.length < 6) {
                setIsConfirmPasswordValid(false);
                setConfirmPasswordHelper("Password must have at least 6 characters");
            }
        } else if (password !== confirmPassword) {
            setIsPasswordValid(false);
            setIsConfirmPasswordValid(false);
            setPasswordHelper("Passwords do not match");
            setConfirmPasswordHelper("Passwords do not match");
        } else {
            setIsPasswordValid(true);
            setIsConfirmPasswordValid(true);
        }
    }, [password, confirmPassword]);

    const isFormValid = () => {
        return email && email !== "" &&
            password && password !== "" &&
            confirmPassword && confirmPassword !== "" &&
            password === confirmPassword;
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleMouseDownConfirmPassword = (event) => {
        event.preventDefault();
    };

    const onImageUploadChange = (ev) => {
        const newImage = ev.target.files[0];
        if (newImage && newImage !== "") {
            setImage(newImage);
        } else {
            setImage("");
        }
    }

    const onSubmit = (ev) => {
        ev.preventDefault();

        if (isFormValid()) {
            const form = new FormData();
            form.append('name', name);
            form.append('email', email);
            form.append('password', password);
            form.append('confirmPassword', confirmPassword);
            if (image) form.append('image', image, image.name);
            axios.post(`${serverEndPoint}/user/register`, form, {
                headers: {
                    'accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.8',
                    'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
                }
            }).then((resp) => {
                if (resp.status === 200) {
                    setSnackBarMessage(`You have successfully registered! Welcome ${name}`);
                    setSnackBarSeverity("success");
                    setUser(resp.data.user);
                    setTimeout(() => {
                        history.push('/');
                    }, 2000);
                }
            }).catch((err) => {
                setSnackBarMessage(`Registration failed: ${err.response.data.errors[0].msg}`);
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
                <Typography variant="h1">Register</Typography>
            </Grid>
            <Grid container item justify="center">
                <form
                    className={classes.formClass} noValidate autoComplete="off">
                    <div>
                        <TextField
                            id="name"
                            label="Name"
                            error={!name}
                            onChange={(ev) => { onFieldChange(ev, setName) }}
                            variant="outlined"
                            required
                        />
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
                            error={!isPasswordValid}
                            onChange={(ev) => { onFieldChange(ev, setPassword) }}
                            variant="outlined"
                            helperText={passwordHelper}
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
                        <TextField
                            id="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            error={!isConfirmPasswordValid}
                            onChange={(ev) => { onFieldChange(ev, setConfirmPassword) }}
                            variant="outlined"
                            helperText={confirmPasswordHelper}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowConfirmPassword}
                                            onMouseDown={handleMouseDownConfirmPassword}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            required
                        />
                        <input
                            accept="image/*"
                            className={classes.input}
                            id="upload-image"
                            type="file"
                            onChange={onImageUploadChange}
                        />
                        <label className={classes.imageUploadClass} htmlFor="upload-image">
                            <Button variant="contained" color="primary" component="span">
                                Upload profile image
                                </Button>
                        </label>
                        <Typography className={classes.imageUploadClass}>{image ? image.name : ""}</Typography>
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