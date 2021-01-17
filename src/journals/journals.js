import { useState, useEffect } from 'react';
import JournalCard from '../journalCard/journalCard.js';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import axios from 'axios';
import defaultImg from '../assets/pekora.png';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paginationClass: props => ({
        visibility: props.hidePagination ? 'hidden' : 'visible',
        padding: theme.spacing(4),
    })
}));

export default function Journals(props) {
    const [page, setPage] = useState(1);
    let [journals, setJournals] = useState([]);
    let { nJournals = 3, hidePagination = false } = props;
    nJournals = Number(nJournals);
    const classes = useStyles({ hidePagination });

    const maxPage = Math.ceil(journals.length / nJournals);

    const PaginationChanged = (event, page) => {
        setPage(page);
        console.log((page - 1) * nJournals, (page - 1) * nJournals + nJournals);
    };

    useEffect(() => {
        if (props.journals) {
            setJournals(props.journals);
        } else {
            axios.get('http://localhost:5000/journals/').then((resp) => {
                setJournals(resp.data);
            }).catch((err) => {
                console.log(err);
            });
        }
    }, [props.journals]);

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