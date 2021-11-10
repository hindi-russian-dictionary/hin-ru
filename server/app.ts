import {URL} from 'url';
import express, {RequestHandler} from 'express';

import {handler as indexHandler} from 'server/serverless';
import {handler as pingHandler} from 'server/serverless/ping';
import {handler as echoHandler} from 'server/serverless/echo';
import {HttpMethod, ServerlessHandler} from 'server/types/serverless';

const app = express();
// Не тратим силы на парсинг query, которую не будем использовать
app.set('query parser', false);

type Entry<T> = [keyof T, T[keyof T]];
const remapValues = <T, E>(
  obj: T,
  mapper: (entry: Entry<T>, index: number, entries: Entry<T>[]) => Entry<E>
): E => {
  return Object.fromEntries(
    Object.entries(obj).map(mapper as any)
  ) as unknown as E;
};

const convertHandlerToMiddleware = (
  handler: ServerlessHandler
): RequestHandler => {
  return async (req, res) => {
    const parsedUrl = new URL('http://localhost' + req.originalUrl);

    const parsedHeaders = req.rawHeaders
      .reduce<[string, string][]>((headerTuples, line, index) => {
        if (index % 2 === 0) {
          headerTuples.push([line, '']);
        } else {
          headerTuples[headerTuples.length - 1][1] = line;
        }
        return headerTuples;
      }, [])
      .reduce<Record<string, string[]>>(
        (parsedHeaders, [[keyFirst, ...keyRest], value]) => {
          const key = keyFirst.toUpperCase() + keyRest.join('');
          if (!parsedHeaders[key]) {
            parsedHeaders[key] = [];
          }
          parsedHeaders[key].push(value);
          return parsedHeaders;
        },
        {}
      );
    // Так в Облаке
    delete parsedHeaders['User-Agent'];
    if (!parsedHeaders['Content-Length']) {
      parsedHeaders['Content-Length'] = ['0'];
    }

    const parsedQuery = [...parsedUrl.searchParams].reduce<
      Record<string, string[]>
    >((parsedQuery, [key, value]) => {
      if (!parsedQuery[key]) {
        parsedQuery[key] = [];
      }
      parsedQuery[key].push(value);
      return parsedQuery;
    }, {});

    const httpMethod = req.method as HttpMethod;

    const result = await handler(
      {
        httpMethod,
        url: req.originalUrl,
        params: {
          // Только потому что такого формата у нас OpenAPI
          path: req.path.slice(1),
        },
        multiValueParams: {
          // Только потому что такого формата у нас OpenAPI
          path: [req.path.slice(1)],
        },
        pathParams: {
          path: req.path.slice(1),
        },
        path: req.baseUrl + '/{path+}',
        headers: remapValues(parsedHeaders, ([key, values]) => [
          key,
          values[values.length - 1],
        ]),
        multiValueHeaders: parsedHeaders,
        queryStringParameters: remapValues(parsedQuery, ([key, values]) => [
          key,
          values[values.length - 1],
        ]),
        multiValueQueryStringParameters: parsedQuery,
        requestContext: {
          identity: {
            sourceIp: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
          },
          httpMethod,
          requestId: 'local-req-id',
          requestTime: '10/Nov/2021:00:00:00 +0000',
          requestTimeEpoch: 1636504946,
        },
        body: req.body || '',
        isBase64Encoded: true,
        locals: res.locals,
      },
      {
        awsRequestId: 'local-req-id',
        requestId: 'local-req-id',
        invokedFunctionArn: 'local-fn-name',
        functionName: 'local-fn-name',
        functionVersion: 'local-version-name',
        memoryLimitInMB: '128',
        deadlineMs: Date.now() + 5000,
        logGroupName: 'local-group-name',
        getRemainingTimeInMillis: () => 5000,
        getPayload: () => '',
      }
    );
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    res.status(result.statusCode).send(result.body);
  };
};

app.use('/echo/', convertHandlerToMiddleware(echoHandler));
app.use('/ping/', convertHandlerToMiddleware(pingHandler));
app.all('*', convertHandlerToMiddleware(indexHandler));

export {app};
