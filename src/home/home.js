import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import axios from 'axios';
import Journals from '../journals/journals.js';

const useStyles = makeStyles({
    root: {
        padding: '2em'
    },
});

export default function Home() {
    let [journals, setJournals] = useState([]);
    const classes = useStyles();

    useEffect(() => {
        axios.get('http://localhost:5000/journals/recent/3').then((resp) => {
            setJournals(resp.data);
        }).catch((err) => {
            console.log(err);
        });
    }, []);

    return (
        <Grid className={classes.root} container>
            <Grid item xs={12}>
                <Typography variant="h2">Recent Journals:</Typography>
            </Grid>
            <Grid item xs={12}>
                <Journals nJournals="3" journals={journals} hidePagination={true} />
            </Grid>
        </Grid>
    );
};