import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import NavDrawer from '../navDrawer/navDrawer.js';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { useLocation } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  navButton: {
    color: 'white',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  themeSwitchClass: {
    display: 'none'
  }
}));

export default function MenuAppBar({ user = null, setUser, theme }) {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const location = useLocation();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (user) {
      axios.get('http://localhost:5000/user/logout').then((resp) => {
        if (resp.status === 200) {
          setUser(null);
          handleClose();
          history.push('/');
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <NavDrawer />
          <Typography variant="h6" className={classes.title}>
            {
              location.pathname.split('/').map((subLoc, i) => {
                return (
                  <React.Fragment key={'frag' + subLoc + i}>
                    <Button key={'button' + subLoc + i}
                      className={classes.navButton}
                      component={RouterLink}
                      to={location.pathname.split('/').slice(0, i + 1).join('/')}>{i === 0 ? 'Home' : subLoc}
                    </Button>
                    { (location.pathname === '/' || location.pathname.split('/').length === i + 1) ? '' : <span>&gt;</span>}
                  </React.Fragment>
                )
              })
            }
          </Typography>
          <Switch className={classes.themeSwitchClass} checked={theme.themeColor === "dark"} onChange={() => theme.setThemeColor(theme.themeColor === 'light' ? 'dark' : 'light')} />
          <Typography variant="h6" className={classes.welcome}>
            Welcome! {user ? user.name : 'Guest'}
          </Typography>
          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              {user && <MenuItem onClick={handleClose}>Profile</MenuItem>}
              {user && <MenuItem onClick={handleLogout}>Logout</MenuItem>}
              {!user && <MenuItem onClick={handleClose} component={RouterLink} to="/login">Login</MenuItem>}
              {!user && <MenuItem onClick={handleClose} component={RouterLink} to="/register">Register</MenuItem>}
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    </div >
  );
}
