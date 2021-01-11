import { useState, useEffect } from 'react';
import JournalCard from '../journalCard/journalCard.js';

import {
    useLocation
} from 'react-router-dom';
import { Grid } from '@material-ui/core';

export default function Journals(props) {
    const [id, setId] = useState(0);
    const [isInit, setIsInit] = useState(false);
    const location = useLocation();

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

    ];

    useEffect(() => {
        let id = 0;
        if (location.pathname !== '/journals')
            id = Number(location.pathname.split('/')[2]);
        setId(id);
        setIsInit(true);
    }, [isInit, location]);

    return (
        <>
            <Grid container>
                <Grid container item alignItems="center" justify="center" spacing={8}>
                    {journals.slice(0, Number(props.nJournals)).map((journal, i) => {
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