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
const Algorithm = lazy(() => import('./algorithm/algorithm.js'));
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
    }
  });

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
              <Route path="/algorithm">
                <Algorithm />
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
