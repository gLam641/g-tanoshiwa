import { useState, useEffect } from 'react';
import JournalCard from '../journalCard/journalCard.js';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

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
    newControlsClass: props => ({
        paddingTop: theme.spacing(4),
        paddingRight: theme.spacing(4),
        display: props.hideNew ? 'none' : 'flex',
        visibility: props.hideNew ? 'hidden' : 'visible',
    }),
}));

const arrowIcon = (sort) => {
    return sort.order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;
};

export default function Journals({ nJournals = 6, user = null }) {
    const location = useLocation();
    const [journals, setJournals] = useState([]);
    const [hideNew, setHideNew] = useState(true);
    const [hidePagination, setHidePagination] = useState(true);
    const [hideControls, setHideControls] = useState(true);
    nJournals = Number(nJournals);
    const classes = useStyles({ hideControls, hidePagination, hideNew });
    const [maxJournalsCount, setMaxJournalsCount] = useState(0);
    const [sort, setSort] = useState([
        { type: 'date', order: 'desc', isSelected: true },
        { type: 'alpha', order: 'asc', isSelected: false },
    ]);
    const [search, setSearch] = useState('');

    let searchTimeout = null;

    const maxPage = Math.ceil(maxJournalsCount / nJournals);

    const PaginationChanged = (event, page) => {
        axios.get(`http://localhost:5000/journals/recent/${nJournals}/${page}`).then((resp) => {
            setJournals(resp.data.journals);
            setMaxJournalsCount(resp.data.maxJournalsCount);
        }).catch((err) => {
            console.log(err);
        });
    };

    const onSearchChange = (ev) => {
        clearTimeout(searchTimeout);
        const newSearch = ev.target.value;
        if (newSearch && newSearch !== '') {
            searchTimeout = setTimeout(() => {
                setSearch(newSearch);
            }, 500);
        } else {
            setSearch('');
        }
    };

    const getSelectedSort = () => {
        return sort.filter((s) => { return s.isSelected })[0];
    }

    const onSortClick = (ev, sortType) => {
        const { type, order } = getSelectedSort();
        if (sortType === type) {
            setSort(sort.map((s) => {
                if (s.isSelected) s.order = order === 'asc' ? 'desc' : 'asc';
                return s;
            }));
        } else {
            setSort(sort.map((s) => {
                s.isSelected = s.type === sortType;
                return s;
            }));
        }
    };

    useEffect(() => {
        setHideNew(location.pathname !== '/journals' || user === null);
        setHidePagination(location.pathname !== '/journals');
        setHideControls(location.pathname !== '/journals');
    }, [location.pathname, user]);

    useEffect(() => {
        let isMounted = true;
        axios.get(`http://localhost:5000/journals/recent/${nJournals}`, {
            params: {
                nJournals,
                search,
                sort: sort.filter((s) => { return s.isSelected })[0]
            }
        }).then((resp) => {
            if (isMounted) {
                setJournals(resp.data.journals);
                setMaxJournalsCount(resp.data.maxJournalsCount);
            }
        }).catch((err) => {
            console.log(err);
        });
        return () => { isMounted = false; };
    }, [user, search, sort, nJournals]);

    return (
        <>
            <Grid container className={classes.root}>
                <Grid className={classes.newControlsClass} container item xs={12}>
                    <Grid item xs={8}></Grid>
                    <Grid container item justify="flex-end" xs={4}>
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
                <Grid className={classes.controlsClass} container item xs={12}>
                    <Grid item xs={4}>
                        <TextField
                            id="search"
                            label="Search"
                            type="search"
                            onChange={onSearchChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            }}
                            variant="outlined"
                            size="small"
                            fullWidth={true}
                        />
                    </Grid>
                    <Grid className={classes.paginationClass} container item justify="center" alignItems="center" xs={4}>
                        <Pagination count={maxPage} showFirstButton showLastButton variant="outlined" shape="rounded" onChange={PaginationChanged} />
                    </Grid>
                    <Grid container item justify="flex-end" xs={4}>
                        <ButtonGroup color="primary" aria-label="outlined primary button group">
                            <Button
                                onClick={(ev) => { onSortClick(ev, 'date') }}
                                variant={getSelectedSort().type === 'date' ? 'contained' : 'outlined'}
                                endIcon={arrowIcon(sort.filter((s) => { return s.type === 'date' })[0])}>
                                Date
                            </Button>
                            <Button
                                onClick={(ev) => { onSortClick(ev, 'alpha') }}
                                variant={getSelectedSort().type === 'alpha' ? 'contained' : 'outlined'}
                                endIcon={arrowIcon(sort.filter((s) => { return s.type === 'alpha' })[0])}>
                                A-Z
                            </Button>
                        </ButtonGroup>
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