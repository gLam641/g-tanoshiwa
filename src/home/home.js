import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import Journals from '../journals/journals.js';

const useStyles = makeStyles({
    root: {
        padding: '2em'
    },
});

export default function Home({ user }) {
    const classes = useStyles();

    return (
        <Grid className={classes.root} container>
            <Grid item xs={12}>
                <Typography variant="h1">Recent Journals:</Typography>
            </Grid>
            <Grid item xs={12}>
                <Journals nJournals="3" user={user} />
            </Grid>
        </Grid>
    );
};