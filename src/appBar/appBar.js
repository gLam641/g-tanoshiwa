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
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Button from '@material-ui/core/Button';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
import defaultImg from '../assets/pekora.png';
import { serverEndPoint } from '../config.js';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 0,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: 'white',
  },
  navButton: {
    color: 'white',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    '&:hover span': {
      textDecoration: 'underline'
    }
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
      axios.get(`${serverEndPoint}/user/logout`).then((resp) => {
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

  const separateCamelCase = (str, i) => {
    // Not the best solution, but prevents this from affecting journal ids
    if (i !== 1) return str;
    let newStr = '';
    for (let c of str) {
      if (c === c.toUpperCase()) {
        newStr += ` ${c}`;
      } else {
        newStr += c;
      }
    }
    return newStr;
  }

  return (
    <div id="app_bar" className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <NavDrawer />
          <Breadcrumbs className={classes.title} separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            {
              location.pathname.replace(/\/$/, '').split('/').map((subLoc, i) => {
                return (
                  <Button key={'button' + subLoc + i}
                    className={classes.navButton}
                    component={RouterLink}
                    to={location.pathname.split('/').slice(0, i + 1).join('/')}>
                    {i === 0 ? 'Home' : separateCamelCase(subLoc, i)}
                  </Button>
                )
              })
            }
          </Breadcrumbs>
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
              {
                user ?
                  <Avatar
                    alt={user.name}
                    src={user.profileImage !== "" ? user.profileImage : defaultImg}
                  /> :
                  <AccountCircle />
              }
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
              {user && <MenuItem onClick={handleClose} component={RouterLink} to="/profile">Profile</MenuItem>}
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
