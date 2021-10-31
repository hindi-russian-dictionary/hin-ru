import React from 'react';
import {StaticRouter} from 'react-router-dom/server';

import {App} from 'client/components/app/app';

type Props = {
  location: string;
};

export const Entry: React.FC<Props> = (props) => (
  <React.StrictMode>
    <StaticRouter location={props.location}>
      <App />
    </StaticRouter>
  </React.StrictMode>
);
