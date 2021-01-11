import { useState } from 'react';
import JournalCard from '../journalCard/journalCard.js';
import { makeStyles } from '@material-ui/core/styles';

import { Grid } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paginationClass: {
        padding: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

export default function Journals(props) {
    const [page, setPage] = useState(1);
    const nJournals = Number(props.nJournals);
    const classes = useStyles();

    let journals = [
        {
            id: 0,
            title: 'Post 0',
            content: 'I am the first post. Yahoo!'
        },
        {
            id: 1,
            title: 'Post 1',
            content: 'I am the second post, desu.'
        },
        {
            id: 2,
            title: 'Post 2',
            content: 'Yo yo, this is third post.'
        },
        {
            id: 3,
            title: 'Post 3',
            content: '3'
        },
        {
            id: 4,
            title: 'Post 4',
            content: '4'
        },
        {
            id: 5,
            title: 'Post 5',
            content: '5'
        },
        {
            id: 6,
            title: 'Post 6',
            content: '6'
        },
        {
            id: 7,
            title: 'Post 7',
            content: '7'
        },
        {
            id: 8,
            title: 'Post 8',
            content: '8'
        },
        {
            id: 9,
            title: 'Post 9',
            content: '9'
        },
        {
            id: 10,
            title: 'Post 10',
            content: '10'
        },
        {
            id: 11,
            title: 'Post 11',
            content: '11'
        },
        {
            id: 12,
            title: 'Post 12',
            content: '12'
        },
    ];

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
                                <JournalCard />
                            </Grid>
                        )
                    })}
                </Grid>
            </Grid>
        </>
    );
}