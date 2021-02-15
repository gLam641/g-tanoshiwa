import { useState } from 'react';
import { Grid, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';
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
    submitClass: {
        marginTop: '2em',
        marginLeft: '8px'
    }
}));

export default function Contact({ userEmail = "" }) {
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const [content, setContent] = useState("");
    const [contentHelper, setContentHelper] = useState("");
    const [email, setEmail] = useState(userEmail);

    const classes = useStyles();
    const history = useHistory();

    const onContentChange = (ev) => {
        const newContent = ev.target.value;
        if (newContent && newContent !== "") {
            setContent(newContent);
            setContentHelper("");
        } else {
            setContent("");
        }
    };

    const onEmailChange = (ev) => {
        const newEmail = ev.target.value;
        if (newEmail && newEmail !== "") {
            setEmail(newEmail);
        } else {
            setEmail("");
        }
    };

    const isFormValid = () => {
        return content && content !== "" && email && email !== "";
    };

    const onSubmit = (ev) => {
        ev.preventDefault();

        if (isFormValid()) {
            axios.post(`${serverEndPoint}/contact/`, {
                content,
                email
            }).then((resp) => {
                console.log(resp);
                if (resp.status === 200 || resp.status === 201) {
                    setSnackBarMessage("Your message has been sent successfully");
                    setSnackBarSeverity("success");
                    setTimeout(() => {
                        history.push('/');
                    }, 3000);
                }
            }).catch((err) => {
                console.log('Failed to send contact message', err);
                setSnackBarMessage("Failed to send your message. Please try again.");
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
                <Typography variant="h1">Contact</Typography>
            </Grid>
            <Grid container item justify="center">
                <form
                    className={classes.formClass} noValidate autoComplete="off">
                    <div>
                        <TextField
                            id="email"
                            className={classes.emailClass}
                            label="Email"
                            error={!email}
                            onChange={onEmailChange}
                            variant="outlined"
                            defaultValue={email}
                            required
                        />
                        <TextField
                            id="content"
                            className={classes.contentClass}
                            label="Message contents"
                            error={!content}
                            onChange={onContentChange}
                            helperText={contentHelper}
                            variant="outlined"
                            multiline
                            required
                            rows={10}
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