import React from 'react';
import {isNil, omitBy} from 'lodash';

export type ApiParams<I> = {
  token?: string | null;
  url: string | ((input: InputParams<I>) => string);
  body?: string | ((input: InputParams<I>) => string | undefined);
  headers?: Partial<Record<string, string>>;
  method?: string;
};

export type InputParams<I = unknown> = {
  signal?: AbortSignal;
  context?: I;
};

export const useApi = <R, I = unknown>(
  params: ApiParams<I>
): ((input?: InputParams<I>) => Promise<R>) => {
  return React.useCallback(
    async (input = {}) => {
      const headers: Record<string, string> = {
        ...(omitBy(params.headers, isNil) as Record<string, string>),
      };
      if (params.token) {
        headers['X-Firebase-Token'] = params.token;
      }
      const url =
        typeof params.url === 'string' ? params.url : params.url(input);
      const body = params.body
        ? typeof params.body === 'string'
          ? params.body
          : params.body(input)
        : undefined;
      const response = await fetch(url, {
        method: params.method || 'GET',
        headers,
        signal: input.signal,
        body,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      }
      return text;
    },
    [params.token, params.headers, params.url, params.method, params.body]
  );
};
