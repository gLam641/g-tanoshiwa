import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        padding: '2rem'
    }
});

export default function Journal(props) {
    const { title, content } = { title: 'title', content: 'content' };
    const classes = useStyles();

    return (
        <>
            <Grid container className={classes.root}>
                <Grid container item spacing={4}>
                    <Grid item xs={12}>
                        <Typography variant="h1">{title}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">{content}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}