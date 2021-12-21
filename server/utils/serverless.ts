import {StatusCodes} from 'http-status-codes';
import {ServerlessHandler, ServerlessResponse} from 'server/types/serverless';

export class ServerlessResponseError extends Error {
  response: ServerlessResponse;

  constructor(response: ServerlessResponse) {
    super(`Serverless response error with code ${response.statusCode}`);
    this.response = response;
    // see https://github.com/microsoft/TypeScript/issues/13965
    Object.setPrototypeOf(this, ServerlessResponseError.prototype);
  }
}

export const wrapHandler = (
  methods: string[],
  handler: ServerlessHandler
): ServerlessHandler => {
  return async (event, context) => {
    if (!methods.includes(event.httpMethod)) {
      return {
        statusCode: StatusCodes.METHOD_NOT_ALLOWED,
        body: `Expected to use one of "${methods.join(
          ' | '
        )}" methods in this handler`,
      };
    }
    try {
      return await handler(event, context);
    } catch (e) {
      if (e instanceof ServerlessResponseError) {
        return e.response;
      }
      throw e;
    }
  };
};
