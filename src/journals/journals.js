import { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import {
    Link as RouterLink,
    useLocation
} from 'react-router-dom';

const useStyles = makeStyles({
    list: {
        margin: '10px 0'
    }
});

export default function Journals() {
    const [id, setId] = useState(0);
    const [isInit, setIsInit] = useState(false);
    const location = useLocation();
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
    ];

    useEffect(() => {
        let id = 0;
        if (location.pathname !== '/journals')
            id = Number(location.pathname.split('/')[2]);
        setId(id);
        setIsInit(true);
    }, [isInit, location]);

    useEffect(() => {
        console.log('journals effect', id, location);
    });

    return (
        <>
            <Typography variant="h1">Journals</Typography>
            <ul>
                {journals.map((journal) => {
                    return (
                        <li className={classes.list} key={journal.id} >
                            <Button variant="contained" color="primary" component={RouterLink} to={`/journals/${journal.id}`} onClick={() => { setId(journal.id) }}>
                                {journal.title}
                            </Button>
                        </li>
                    )
                })}
            </ul>
            <Typography variant="body1">
                {
                    location.pathname === '/journals' ?
                        'Please select a topic' :
                        journals[id].content
                }
            </Typography>
        </>
    );
}