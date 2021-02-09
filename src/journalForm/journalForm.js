import { useState } from 'react';
import { Grid, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
        margin: '8px',
        display: 'inline-block'
    },
    submitClass: {
        margin: '8px'
    },
    input: {
        display: 'none'
    }
}));

export default function JournalForm() {
    const [title, setTitle] = useState("");
    const [titleHelper, setTitleHelper] = useState("");
    const [content, setContent] = useState("");
    const [contentHelper, setContentHelper] = useState("");
    const [images, setImages] = useState([]);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    const classes = useStyles();
    const history = useHistory();

    const onTitleChange = (ev) => {
        const newTitle = ev.target.value;
        if (newTitle && newTitle !== "") {
            setTitle(newTitle);
            setTitleHelper("");
        } else {
            setTitle("");
            setTitleHelper("Title cannot be empty");
        }
    };

    const onContentChange = (ev) => {
        const newContent = ev.target.value;
        if (newContent && newContent !== "") {
            setContent(newContent);
            setContentHelper("");
        } else {
            setContent("");
            setContentHelper("Title cannot be empty");
        }
    };

    const onImageUploadChange = (ev) => {
        const newImages = ev.target.files;
        console.log(ev);
        if (newImages && newImages !== []) {
            setImages(newImages);
        } else {
            setImages([]);
        }
    };

    const onSubmit = (ev) => {
        ev.preventDefault();
        // TODO: replace hard coded values when available
        const form = new FormData();
        form.append('userId', 0);
        form.append('privacy', 'public');
        form.append('title', title);
        [...images].forEach((image) => {
            form.append('images', image, image.name)
        });
        form.append('content', content);
        axios.post('http://localhost:5000/journals/', form, {
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.8',
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            }
        }).then((resp) => {
            console.log(resp);
            if (resp.status === 201) {
                history.push('/journals');
            } else if (resp.status === 200) {
                // an existing journal with the same title by this user already exists
                setIsSnackbarOpen(true);
            }
        }).catch((err) => {
            console.log('Failed to create new journal', err);
        });

        // axios.post('http://localhost:5000/journals/', {
        //     userId: 0,
        //     privacy: 'public',
        //     title: title,
        //     images: images,
        //     content: content
        // }).then((resp) => {
        //     console.log(resp);
        //     if (resp.status === 201) {
        //         history.push('/journals');
        //     } else if (resp.status === 200) {
        //         // an existing journal with the same title by this user already exists
        //         setIsSnackbarOpen(true);
        //     }
        // }).catch((err) => {
        //     console.log('Failed to create new journal', err);
        // });
    };

    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsSnackbarOpen(false);
    };

    return (
        <Grid container className={classes.root}>
            <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity="success">
                    This is a success message!
                </Alert>
            </Snackbar>
            <Grid item xs={12}>
                <Typography variant="h1">New Journal</Typography>
            </Grid>
            <Grid container item justify="center">
                <form
                    className={classes.formClass} noValidate autoComplete="off">
                    <div>
                        <TextField
                            id="title"
                            label="Title"
                            error={!title}
                            onChange={onTitleChange}
                            helperText={titleHelper}
                            required
                            variant="outlined"
                        />
                        <input
                            accept="image/*"
                            className={classes.input}
                            id="upload-image"
                            multiple
                            type="file"
                            onChange={onImageUploadChange}
                        />
                        <label className={classes.imageUploadClass} htmlFor="upload-image">
                            <Button variant="contained" color="primary" component="span">
                                Upload images
                                </Button>
                        </label>
                        <Typography className={classes.imageUploadClass}>{[...images].map((i) => i.name).join(', ')}</Typography>
                        <TextField
                            id="content"
                            label="Content"
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