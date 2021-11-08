import {OpenAPIV3} from 'openapi-types';
import {Manifest} from 'webpack-manifest-plugin';

export type DummyIntegration = {
  type: 'dummy';
  http_code: number;
  http_headers: Record<string, string[]>;
  content: Record<string, string>;
};

export type ObjectStorageIntegration = {
  type: 'object_storage';
  bucket: string;
  object: string;
  error_object?: string;
  presigned_redirect?: boolean;
  service_account_id?: string;
};

export type ServerlessFunctionIntegration = {
  function_id: string;
  tag?: string;
  service_account_id?: string;
  payload_format_version?: '0.1' | '1.0';
  context?: object | string;
};

export type ServerlessContainerIntegration = {
  container_id: string;
  service_account_id?: string;
  context?: object | string;
};

export type ApiGatewayIntegration =
  | DummyIntegration
  | ObjectStorageIntegration
  | ServerlessFunctionIntegration
  | ServerlessContainerIntegration;

export type GatewayExtension = {
  'x-yc-apigateway-integration': ApiGatewayIntegration;
};

export type GatewayApiDocument = OpenAPIV3.Document<GatewayExtension>;
export type GatewayApiPaths = OpenAPIV3.PathsObject<GatewayExtension>;

export type ServerlessFunctionDescription = {
  path: string;
  filename: string;
  hash: string;
  externalModuleIds: string[];
};

export type ServerlessFunctionDescriptionWithId =
  ServerlessFunctionDescription & {
    id: string;
    tag: string;
  };

export type ServerWebpackResult = {
  outputPath: string;
  functionDescriptions: ServerlessFunctionDescription[];
};

export type ClientWebpackResult = {
  storageFolder: string;
  outputPath: string;
  manifest: Manifest;
};
