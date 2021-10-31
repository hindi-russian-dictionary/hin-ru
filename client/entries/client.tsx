import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

import {App} from 'client/components/app/app';

export const Entry: React.FC = () => (
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
