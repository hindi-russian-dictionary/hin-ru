import {StatusCodes} from 'http-status-codes';

import {ServerlessHandler} from 'server/types/serverless';

export const handler: ServerlessHandler = async () => {
  return {
    statusCode: StatusCodes.OK,
    body: 'pong',
  };
};
