import { useState } from 'react';
import JournalCard from '../journalCard/journalCard.js';
import { makeStyles } from '@material-ui/core/styles';

import { Grid } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';

import { journals } from '../assets/mock_jounals.js';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paginationClass: {
        padding: theme.spacing(4),
    }
}));

export default function Journals(props) {
    const [page, setPage] = useState(1);
    const nJournals = Number(props.nJournals);
    const classes = useStyles();

    const maxPage = Math.ceil(journals.length / nJournals);

    const PaginationChanged = (event, page) => {
        setPage(page);
        console.log((page - 1) * nJournals, (page - 1) * nJournals + nJournals);
    };

    return (
        <>
            <Grid container className={classes.root}>
                <Grid className={classes.paginationClass} container item justify="center" xs={12}>
                    <Pagination count={maxPage} showFirstButton showLastButton variant="outlined" shape="rounded" onChange={PaginationChanged} />
                </Grid>
                <Grid container item alignItems="center" justify="center" spacing={8}>
                    {journals.slice((page - 1) * nJournals, (page - 1) * nJournals + nJournals).map((journal, i) => {
                        return (
                            <Grid item key={journal.id} xs={12} sm={6} md={4}>
                                <JournalCard journalInfo={journal} />
                            </Grid>
                        )
                    })}
                </Grid>
            </Grid>
        </>
    );
}