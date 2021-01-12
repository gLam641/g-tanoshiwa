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

import './App.css';
import {
  BrowserRouter as Router,
  Switch as RouterSwitch,
  Route
} from 'react-router-dom';

const Contact = lazy(() => import('./contact/contact.js'));
const Journals = lazy(() => import('./journals/journals.js'));
const Home = lazy(() => import('./home/home.js'));

function App() {
  const [themeColor, setThemeColor] = useState('light');

  const theme = createMuiTheme({
    palette: {
      type: themeColor
    }
  });

  return (
    <Router>
      <div>
        <ThemeProvider theme={theme}>
          <MenuAppBar theme={{ themeColor, setThemeColor }} />
          {/* adjust height of MenuAppBar and Paper to avoid scrollbar*/}
          <Paper style={{ height: "100%", boxShadow: "none" }}>
            <Suspense fallback={<div>Loading...</div>}>
              <RouterSwitch>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/journals/:id">
                  <Journal />
                </Route>
                <Route path="/journals">
                  <Journals nJournals="6" />
                </Route>
                <Route path="/contact">
                  <Contact />
                </Route>
                <Route path="*">
                  <div>Invalid path</div>
                </Route>
              </RouterSwitch>
            </Suspense>
          </Paper>
        </ThemeProvider>
      </div>
    </Router>
  );
}

export default App;
