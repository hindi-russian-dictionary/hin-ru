import express, {RequestHandler} from 'express';

import {handler as indexHandler} from 'server/serverless/functions/index';
import {handler as pingHandler} from 'server/serverless/functions/ping';
import {HttpMethod, ServerlessHandler} from 'server/serverless/types';

const app = express();

const convertHandlerToMiddleware = (
  handler: ServerlessHandler
): RequestHandler => {
  return async (req, res) => {
    const httpMethod = req.method as HttpMethod;
    // TODO: Заполнить правильно
    const result = await handler(
      {
        httpMethod,
        url: req.url,
        params: {},
        multiValueParams: {},
        pathParams: {},
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        requestContext: {
          identity: {
            sourceIp: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
          },
          httpMethod,
          requestId: 'local',
          requestTime: '',
          requestTimeEpoch: -1,
        },
        body: req.body,
        isBase64Encoded: false,
        locals: res.locals,
      },
      {
        awsRequestId: 'local',
        requestId: 'local',
        invokedFunctionArn: 'unknown',
        functionName: 'local',
        functionVersion: 'local',
        memoryLimitInMB: 'Infinity',
        deadlineMs: -1,
        logGroupName: 'local',
        getRemainingTimeInMillis: () => Infinity,
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

app.use('/ping', convertHandlerToMiddleware(pingHandler));
app.all('*', convertHandlerToMiddleware(indexHandler));

export {app};
