import { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import ImageGallery from '../imageGallery/imageGallery.js';
import { useParams } from 'react-router-dom';
import defaultImg from '../assets/pekora.png';
import axios from 'axios';
//import { journals } from '../assets/mock_journals.js';

const useStyles = makeStyles({
    root: {
        padding: '2rem'
    }
});

export default function Journal() {
    const [journal, setJournal] = useState();
    const id = useParams().id;
    //const journal = journals.find((j) => Number(j.id) === Number(id));
    // let { title, content, images } = journal;
    const classes = useStyles();

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/journals/${id}`).then((resp) => {
                if (!resp.data.images || resp.data.images === []) {
                    resp.data.images = [defaultImg];
                }
                setJournal(resp.data);
            }).catch((err) => {
                console.log(err);
            });
        }
    }, [id]);

    return (
        <>
            <Grid container className={classes.root}>
                {
                    journal ?
                        <Grid container item spacing={4}>
                            <Grid item xs={12}>
                                <Typography variant="h1">{journal.title}</Typography>
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