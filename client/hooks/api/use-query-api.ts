import React from 'react';
import {QueryFunctionContext} from 'react-query/types/core/types';

import {ApiParams, useApi} from 'client/hooks/api/use-api';

export const useQueryApi = <R, I = unknown>(
  params: ApiParams<I>
): ((context: QueryFunctionContext) => Promise<R>) => {
  const api = useApi<R, I>({
    token: params.token,
    url: params.url,
    headers: params.headers,
  });
  return React.useCallback(
    (context) => {
      return api({
        signal: context.signal,
      });
    },
    [api]
  );
};
