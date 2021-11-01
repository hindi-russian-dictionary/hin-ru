import React from 'react';
import {StaticRouter} from 'react-router-dom/server';
import {QueryClient, QueryClientProvider} from 'react-query';

import {App} from 'client/components/app/app';

type Props = {
  location: string;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const Entry: React.FC<Props> = (props) => (
  <React.StrictMode>
    <StaticRouter location={props.location}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StaticRouter>
  </React.StrictMode>
);
