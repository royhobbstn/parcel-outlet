import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import CssBaseline from '@material-ui/core/CssBaseline';

ReactDOM.render(
  <React.Fragment>
  {/*<React.StrictMode>*/}
    <CssBaseline />
    <App />
  {/*</React.StrictMode>*/}
  </React.Fragment>,
  document.getElementById('root')
);
