export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH';

export type RequestContext = {
  identity: {
    sourceIp: string;
    userAgent: string;
  };
  httpMethod: HttpMethod;
  requestId: string;
  requestTime: string; // '26/Dec/2019:14:22:07 +0000'
  requestTimeEpoch: number; // 1577370127
  authorizer?: unknown;
  apiGateway?: {
    operationContext: unknown;
  };
};

export type ServerlessEvent = {
  httpMethod: HttpMethod;
  url: string;
  params: Record<string, string>;
  multiValueParams: Record<string, string[]>;
  pathParams: unknown;
  headers: Record<string, string>;
  multiValueHeaders: Record<string, string[]>;
  queryStringParameters: Record<string, string>;
  multiValueQueryStringParameters: Record<string, string[]>;
  requestContext: RequestContext;
  body: string;
  isBase64Encoded: boolean;
  // Только в окружении express
  locals?: any;
};

export type ServerlessContext = {
  awsRequestId: string;
  requestId: string;
  invokedFunctionArn: string;
  functionName: string;
  functionVersion: string;
  memoryLimitInMB: string;
  deadlineMs: number;
  logGroupName: string;
  token?: {
    access_token: unknown;
    expires_in: unknown;
    token_type: unknown;
  };
  getRemainingTimeInMillis: () => number;
  getPayload: () => object | string;
};

export type ServerlessResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body?: string;
  isBase64Encoded?: boolean;
};

export type ServerlessHandler = (
  event: ServerlessEvent,
  context: ServerlessContext
) => ServerlessResponse | Promise<ServerlessResponse>;
