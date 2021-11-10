import {ServerlessHandler} from 'server/types/serverless';

export const handler: ServerlessHandler = async () => {
  return {
    statusCode: 200,
    body: 'pong',
  };
};
