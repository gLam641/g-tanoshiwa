import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import JournalIcon from '@material-ui/icons/Photo';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';
import BarChartIcon from '@material-ui/icons/BarChart';

import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
    menu: {
        color: 'white'
    },
    pathIcon: {
        color: 'green'
    }
});

export default function NavDrawer() {
    const classes = useStyles();
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    const paths = [
        {
            loc: 'Home',
            to: '/',
            icon: <HomeIcon className={classes.pathIcon} />,
        },
        {
            loc: 'Journals',
            to: '/journals',
            icon: <JournalIcon className={classes.pathIcon} />,
        },
        {
            loc: 'Algorithm',
            to: '/algorithm',
            icon: <BarChartIcon className={classes.pathIcon} />,
        },
        {
            loc: 'Contact',
            to: '/contact',
            icon: <PersonIcon className={classes.pathIcon} />,
        },
    ];

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const list = (anchor) => (
        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === 'top' || anchor === 'bottom',
            })}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {paths.map((path, index) => (
                    <ListItem button key={path.loc} component={RouterLink} to={path.to}>
                        <ListItemIcon>{path.icon}</ListItemIcon>
                        <ListItemText primary={path.loc} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <div>
            {['left'].map((anchor) => (
                <React.Fragment key={anchor}>
                    <Button onClick={toggleDrawer(anchor, true)}><MenuIcon className={classes.menu} /></Button>
                    <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
                        {list(anchor)}
                    </Drawer>
                </React.Fragment>
            ))}
        </div>
    );
}
