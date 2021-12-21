import React from 'react';

import {ApiParams, InputParams, useApi} from 'client/hooks/api/use-api';

type MutateApiParams<I> = ApiParams<I> & {
  skipBody?: boolean;
};

export const useMutateApi = <R, I>(
  params: MutateApiParams<I>
): ((input: I) => Promise<R>) => {
  const bodyFn = React.useCallback(
    (input: InputParams<I>): string | undefined =>
      params.skipBody ? undefined : JSON.stringify(input.context),
    [params.skipBody]
  );
  const headers = React.useMemo(() => {
    if (params.skipBody) {
      return params.headers;
    }
    return {
      ...params.headers,
      'content-type': 'application/json',
    };
  }, [params.skipBody, params.headers]);
  const api = useApi<R, I>({
    method: params.method || 'POST',
    token: params.token,
    url: params.url,
    headers,
    body: bodyFn,
  });
  return React.useCallback((context) => api({context}), [api]);
};
