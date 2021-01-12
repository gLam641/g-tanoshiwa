import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import ImageGallery from '../imageGallery/imageGallery.js';
import { useParams } from 'react-router-dom';
import { journals } from '../assets/mock_journals.js';

const useStyles = makeStyles({
    root: {
        padding: '2rem'
    }
});

export default function Journal() {
    const { id } = useParams();
    const journal = journals.find((j) => Number(j.id) === Number(id));
    const { title, content, images } = journal;
    const classes = useStyles();

    return (
        <>
            <Grid container className={classes.root}>
                <Grid container item spacing={4}>
                    <Grid item xs={12}>
                        <Typography variant="h1">{title}</Typography>
                    </Grid>
                    <ImageGallery images={images} id={id} xs={12} />
                    <Grid item xs={12}>
                        <Typography variant="body1">{content}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}