import Zip from 'adm-zip';
import mime from 'mime-types';
import crypto from 'crypto';
import {
  GatewayApiDocument,
  GatewayApiPaths,
  ServerlessFunctionDescription,
  ServerlessFunctionDescriptionWithId,
} from 'tools/deploy/types';
import {OperationContext} from 'server/serverless/functions';

type GetGatewayConfigParams = {
  functions: {
    descriptions: ServerlessFunctionDescriptionWithId[];
    serviceAccountId: string;
  };
  objectStorage: {
    bucket: string;
    folder: string;
    serviceAccountId: string;
    publicFiles: string[];
  };
};

export const getGatewayConfig = (
  params: GetGatewayConfigParams
): GatewayApiDocument => {
  const publicPaths = params.objectStorage.publicFiles.reduce<GatewayApiPaths>(
    (acc, file) => {
      acc[`/${file}`] = {
        get: {
          'x-yc-apigateway-integration': {
            type: 'object_storage',
            bucket: params.objectStorage.bucket,
            object: `public/${file}`,
            presigned_redirect: true,
            service_account_id: params.functions.serviceAccountId,
          },
          responses: {},
          summary: `Serve public file ${file} from Yandex Cloud Object Storage`,
        },
      };
      return acc;
    },
    {}
  );

  const functionPaths = params.functions.descriptions.reduce<GatewayApiPaths>(
    (acc, fn) => {
      const isIndex = fn.path === 'index';
      let context: OperationContext | undefined;
      if (isIndex) {
        context = {
          objectStorage: {
            bucket: params.objectStorage.bucket,
            folder: params.objectStorage.folder,
          },
        };
      }
      acc[`/${isIndex ? '' : `${fn.path}/`}{path+}`] = {
        get: {
          'x-yc-apigateway-integration': {
            type: 'cloud_functions',
            function_id: fn.id,
            tag: fn.tag,
            service_account_id: params.functions.serviceAccountId,
            context,
          },
          operationId: fn.path,
          parameters: [
            {
              explode: false,
              in: 'path',
              name: 'path',
              required: false,
              style: 'simple',
            },
          ],
          responses: {},
          summary: `Function ${fn.path}`,
        },
      };
      return acc;
    },
    {}
  );

  return {
    openapi: '3.0.0',
    info: {
      title: 'Hin-ru API',
      version: '1.0.0',
    },
    paths: {
      ...functionPaths,
      ...publicPaths,
      '/static/{file+}': {
        get: {
          'x-yc-apigateway-integration': {
            type: 'object_storage',
            bucket: params.objectStorage.bucket,
            object: `${params.objectStorage.folder}/{file}`,
            presigned_redirect: true,
            service_account_id: params.functions.serviceAccountId,
          },
          parameters: [
            {
              explode: false,
              in: 'path',
              name: 'file',
              required: true,
              style: 'simple',
            },
          ],
          responses: {},
          summary: 'Serve static file from Yandex Cloud Object Storage',
        },
      },
    },
  };
};

export const getTagFromContent = (
  fnContent: Buffer,
  packageJson: string
): string => {
  const content = Buffer.concat([fnContent, Buffer.from(packageJson)]);
  const hash = crypto.createHash('sha1').update(content).digest('hex');
  return `hash-${hash}`;
};

export function validateVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Please provide environment variable "${name}"`);
  }
  return value;
}

type ZipFile = {
  name: string;
  content: string | Buffer;
};

export const getZip = (files: ZipFile[]): Buffer => {
  const zip = new Zip();
  files.forEach((file) => {
    zip.addFile(
      file.name,
      typeof file.content === 'string'
        ? Buffer.from(file.content)
        : file.content
    );
  });
  return zip.toBuffer();
};

type PackageJsonParams = {
  name: string;
  originalPackageJson: {
    dependencies: Record<string, string>;
  };
  usedDependencies: string[];
};
export const getCloudPackageJson = (params: PackageJsonParams): object => {
  const packageDependencyEntries = Object.entries(
    params.originalPackageJson.dependencies
  );
  return {
    name: params.name,
    version: '0.0.0',
    dependencies: [...params.usedDependencies]
      .sort()
      .reduce<Record<string, string>>((acc, dependency) => {
        const packageDepEntry = packageDependencyEntries.find(
          ([packageDepName]) => dependency === packageDepName
        );
        if (!packageDepEntry) {
          throw new Error(
            `Dependency ${dependency} was not found in package.json dependencies section!`
          );
        }
        acc[dependency] = packageDepEntry[1];
        return acc;
      }, {}),
  };
};

export const getContentTypeByFilename = (filename: string): string => {
  return mime.lookup(filename) || 'text/plain';
};

export const clone = (obj: object): object => {
  return JSON.parse(JSON.stringify(obj));
};

export const getFunctionName = (fn: ServerlessFunctionDescription): string => {
  return fn.path.replace(/\//g, '--');
};
