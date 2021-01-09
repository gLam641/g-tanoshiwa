import { useState } from 'react';
import { Suspense, lazy } from 'react';
// import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
/* As of writing, Material UI hasn't kept up with react changes. Using createMuiTheme causes the following warning:
 *  findDOMNode is deprecated in StrictMode
 */
import { ThemeProvider, unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core/styles';
import MenuAppBar from './appBar/appBar.js'
import { Paper } from '@material-ui/core';

import './App.css';
import {
  BrowserRouter as Router,
  Switch as RouterSwitch,
  Route
} from 'react-router-dom';

const contact = lazy(() => import('./contact/contact.js'));
const journals = lazy(() => import('./journals/journals.js'));
const home = lazy(() => import('./home/home.js'));

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
          <Paper style={{ height: "100vh" }}>
            <Suspense fallback={<div>Loading...</div>}>
              <RouterSwitch>
                <Route path="/" exact component={home} />
                <Route path="/journals" component={journals} />
                <Route path="/contact" component={contact} />
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
