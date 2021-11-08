import {ServerlessHandler} from 'server/serverless/types';

const handler: ServerlessHandler = async () => {
  return {
    statusCode: 200,
    body: 'pong',
  };
};

export {handler};
