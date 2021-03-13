import { useState } from 'react';
import { Suspense, lazy } from 'react';
// import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
/* As of writing, Material UI hasn't kept up with react changes. Using createMuiTheme causes the following warning:
 *  findDOMNode is deprecated in StrictMode
 */
import { ThemeProvider, unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core/styles';
import MenuAppBar from './appBar/appBar.js';
import { Paper } from '@material-ui/core';
import Journal from './journal/journal.js';
import JournalForm from './journalForm/journalForm.js';

import './App.css';
import {
  BrowserRouter as Router,
  Switch as RouterSwitch,
  Route
} from 'react-router-dom';

const Contact = lazy(() => import('./contact/contact.js'));
const SortAlgorithm = lazy(() => import('./sortAlgorithm/sortAlgorithm.js'));
const PathFinder = lazy(() => import('./pathFinder/pathFinder.js'));
const Journals = lazy(() => import('./journals/journals.js'));
const Profile = lazy(() => import('./profile/profile.js'));
const Login = lazy(() => import('./login/login.js'));
const Register = lazy(() => import('./register/register.js'));
const Home = lazy(() => import('./home/home.js'));

function App() {
  const [themeColor, setThemeColor] = useState('light');
  const [user, setUser] = useState();
  const [journal, setJournal] = useState();

  const theme = createMuiTheme({
    palette: {
      type: themeColor
    },
  });

  const defaultHeadingSize = {
    h1: 2,
    h2: 1.5,
    h3: 1.17,
    h4: 1,
    h5: .83,
    h6: .67
  };

  // Set responsive font size 
  for (let i = 0; i < 7; ++i) {
    const heading = `h${i}`;
    theme.typography[heading] = {
      fontSize: `${defaultHeadingSize[heading] * 1.5}em`,
      [theme.breakpoints.up('md')]: {
        fontSize: `${defaultHeadingSize[heading] * 1.7}em`,
      },
      [theme.breakpoints.up('lg')]: {
        fontSize: `${defaultHeadingSize[heading] * 2}em`,
      },
    }
  }

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <MenuAppBar user={user} setUser={setUser} theme={{ themeColor, setThemeColor }} />
        {/* adjust height of MenuAppBar and Paper to avoid scrollbar*/}
        <Paper style={{ boxShadow: "none" }}>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterSwitch>
              <Route path="/" exact>
                <Home user={user} />
              </Route>
              <Route path="/journals/new">
                <JournalForm user={user} />
              </Route>
              <Route path="/journals/:id/edit">
                <JournalForm user={user} journal={journal} setJournal={setJournal} />
              </Route>
              <Route path="/journals/:id">
                <Journal user={user} journal={journal} setJournal={setJournal} />
              </Route>
              <Route path="/journals">
                <Journals nJournals="6" user={user} />
              </Route>
              <Route path="/contact">
                <Contact userEmail={user ? user.email : ""} />
              </Route>
              <Route path="/sortAlgorithm">
                <SortAlgorithm />
              </Route>
              <Route path="/pathFinder">
                <PathFinder />
              </Route>
              <Route path="/profile">
                <Profile user={user} setUser={setUser} />
              </Route>
              <Route path="/login">
                <Login setUser={setUser} />
              </Route>
              <Route path="/register">
                <Register setUser={setUser} />
              </Route>
              <Route path="*">
                <div>Invalid path</div>
              </Route>
            </RouterSwitch>
          </Suspense>
        </Paper>
      </ThemeProvider>
    </Router>
  );
}

export default App;
