import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import {database} from 'lib/db';
import {App} from 'components/app/app';

database.init();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
