import { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import ImageGallery from '../imageGallery/imageGallery.js';
import { useParams } from 'react-router-dom';
import defaultImg from '../assets/pekora.png';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles({
    root: {
        padding: '2rem'
    }
});

export default function Journal() {
    const history = useHistory();
    const [journal, setJournal] = useState();
    const id = useParams().id;
    const classes = useStyles();

    const onDelete = (event) => {
        axios.delete(`http://localhost:5000/journals/${id}`).then((resp) => {
            history.push('/');
        }).catch((err) => {
            console.log(err);
        });
    };

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/journals/${id}`, {
                headers: {
                    withCredentials: true
                }
            }).then((resp) => {
                if (!resp.data.images || resp.data.images.length === 0) {
                    resp.data.images = [defaultImg];
                }
                setJournal(resp.data);
            }).catch((err) => {
                // todo: show message that the user needs to be logged in
                history.push('/');
            });
        }
    }, [id, history]);

    return (
        <>
            <Grid container className={classes.root}>
                {
                    journal ?
                        <Grid container item spacing={4}>
                            <Grid container item xs={12}>
                                <Grid className={classes.newClass} container item justify="flex-start" xs={8}>
                                    <Typography variant="h1">{journal.title}</Typography>
                                </Grid>
                                <Grid className={classes.newClass} container item justify="flex-end" alignItems="center" sm={4}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={onDelete}
                                        startIcon={<DeleteIcon />}>
                                        Delete Journal
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <ImageGallery images={journal.images} id={id} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">{journal.content}</Typography>
                            </Grid>
                        </Grid>
                        :
                        <></>
                }
            </Grid>
        </>
    )
}