import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyle = makeStyles({
    homeBtn: {
        background: (props) => props.background,
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 48,
        padding: '0 30px',
    }
});

export default function Home() {
    const location = useLocation();

    const homeBtnProps = {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
    };

    const buttonStyle = useStyle(homeBtnProps);

    useEffect(() => {
        if (location.pathname === '/') {
            // console.log('home');
        }
    })

    return (
        <>
            <Typography variant="h1">This is the home page</Typography>

            <Button variant="contained" className={buttonStyle.homeBtn}>
                This is material button
            </Button>

            <Button color="primary" variant="contained">Primary Button</Button>
        </>
    );
};