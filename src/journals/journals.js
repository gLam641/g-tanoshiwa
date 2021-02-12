import { useState, useEffect } from 'react';
import JournalCard from '../journalCard/journalCard.js';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    controlsClass: props => ({
        visibility: props.hideControls ? 'hidden' : 'visible',
        padding: theme.spacing(4),
    }),
    paginationClass: props => ({
        visibility: props.hidePagination ? 'hidden' : 'visible',
    }),
    newClass: props => ({
        visibility: props.hideNew ? 'hidden' : 'visible',
    }),
}));

export default function Journals({ nJournals, user = null }) {
    const location = useLocation();
    const [journals, setJournals] = useState([]);
    const [hideNew, setHideNew] = useState(true);
    const [hidePagination, setHidePagination] = useState(true);
    const [hideControls, setHideControls] = useState(true);
    nJournals = Number(nJournals);
    const classes = useStyles({ hideControls, hidePagination, hideNew });
    const [maxJournalsCount, setMaxJournalsCount] = useState(0);

    const maxPage = Math.ceil(maxJournalsCount / nJournals);

    const PaginationChanged = (event, page) => {
        axios.get(`http://localhost:5000/journals/recent/${nJournals}/${page}`).then((resp) => {
            setJournals(resp.data.journals);
            setMaxJournalsCount(resp.data.maxJournalsCount);
        }).catch((err) => {
            console.log(err);
        });
    };

    useEffect(() => {
        setHideNew(location.pathname !== '/journals' || user === null);
        setHidePagination(location.pathname !== '/journals');
        setHideControls(location.pathname !== '/journals');
    }, [location.pathname, user]);

    useEffect(() => {
        axios.get(`http://localhost:5000/journals/recent/${nJournals}`).then((resp) => {
            setJournals(resp.data.journals);
            setMaxJournalsCount(resp.data.maxJournalsCount);
        }).catch((err) => {
            console.log(err);
        });
    }, [user, nJournals]);

    return (
        <>
            <Grid container className={classes.root}>
                <Grid className={classes.controlsClass} container item xs={12}>
                    <Grid item xs={4}></Grid>
                    <Grid className={classes.paginationClass} container item justify="center" alignItems="center" xs={4}>
                        <Pagination count={maxPage} showFirstButton showLastButton variant="outlined" shape="rounded" onChange={PaginationChanged} />
                    </Grid>
                    <Grid className={classes.newClass} container item justify="flex-end" xs={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            component={RouterLink}
                            to="/journals/new">
                            New Journal
                        </Button>
                    </Grid>
                </Grid>
                <Grid container item alignItems="center" justify="center" spacing={8}>
                    {journals.map((journal, i) => {
                        return (
                            <Grid item key={journal._id} xs={12} sm={6} md={4}>
                                <JournalCard journalInfo={journal} />
                            </Grid>
                        )
                    })}
                </Grid>
            </Grid>
        </>
    );
}