import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import dotenv from 'dotenv';
import {isEqual} from 'lodash';
import jsYaml from 'js-yaml';
import * as fsWalk from '@nodelib/fs.walk';
import md5File from 'md5-file';
import {Duration, Session} from 'yandex-cloud-lite';
import webpack, {StatsChunk, StatsModule} from 'webpack';
import {Manifest} from 'webpack-manifest-plugin';
import * as AWS from 'aws-sdk';
import {CredentialsOptions} from 'aws-sdk/lib/credentials';
import {Listr} from 'listr2';
import {ApiGatewayServiceClient} from 'yandex-cloud-lite/generated/yandex/cloud/serverless/apigateway/v1/apigateway_service_grpc_pb';
import {FunctionServiceClient} from 'yandex-cloud-lite/generated/yandex/cloud/serverless/functions/v1/function_service_grpc_pb';
import {
  CreateFunctionMetadata,
  CreateFunctionVersionMetadata,
  DeleteFunctionMetadata,
} from 'yandex-cloud-lite/generated/yandex/cloud/serverless/functions/v1/function_service_pb';
import {
  CreateApiGatewayMetadata,
  UpdateApiGatewayMetadata,
} from 'yandex-cloud-lite/generated/yandex/cloud/serverless/apigateway/v1/apigateway_service_pb';
import {Resources} from 'yandex-cloud-lite/generated/yandex/cloud/serverless/functions/v1/function_pb';
import {OperationService} from 'yandex-cloud-lite/dist/services/operation';

import packageJson from '../package.json';

import {
  clone,
  getCloudPackageJson,
  getContentTypeByFilename,
  getFunctionName,
  getGatewayConfig,
  getTagFromContent,
  getZip,
  tryCleanDir,
  validateVariable,
} from 'tools/deploy/utils';
import clientEntry from 'tools/webpack/client';
import serverEntry from 'tools/webpack/server';
import {
  ClientWebpackResult,
  GatewayApiDocument,
  ServerlessFunctionDescription,
  ServerlessFunctionDescriptionWithId,
  ServerWebpackResult,
} from 'tools/deploy/types';
import {paths} from 'server/lib/paths';

const promisifiedReadFile = util.promisify(fs.readFile);
const promisifiedWalk = util.promisify(fsWalk.walk);

dotenv.config({path: './.env.deploy'});

const byteMultiplier = 1024;
const KiB = byteMultiplier;
const MiB = byteMultiplier * KiB;
const SECOND = 1000;
const MINUTE = 60 * SECOND;

type DeployContext = {
  serverWebpack?: ServerWebpackResult;
  clientWebpack?: ClientWebpackResult;
  folderId: string;
  auth?: {
    session: Session;
    serviceAccountId: string;
  };
  objectStorage: {
    shouldSkipACLUpdate?: boolean;
    shouldSkipUpload?: boolean;
    publicFiles?: string[];
  };
  leftoverFunctions: {
    id: string;
    name: string;
  }[];
  functions: {
    id?: string;
    tag?: string;
    tagMap?: Record<string, string[]>;
  }[];
  gateway: {
    nextSpec?: GatewayApiDocument;
    id?: string;
    url?: string;
  };
};

type UpdateFunctionParams = {
  session: Session;
  fn: ServerlessFunctionDescription;
  index: number;
  folderId: string;
  outputPath: string;
};

function updateFunction(params: UpdateFunctionParams): Listr<DeployContext> {
  const client = params.session.createClient(FunctionServiceClient);
  const operationClient = new OperationService(params.session);
  const fnName = getFunctionName(params.fn);
  const fnDescription = `Function "${params.fn.path}"`;
  return new Listr([
    {
      title: 'Verifying function',
      task: async (ctx, task) => {
        const response = await client.list({
          folderId: params.folderId,
          pageSize: 1,
          filter: `name="${fnName}"`,
        });
        const fnList = response.getFunctionsList();
        if (fnList.length === 0) {
          task.title = 'No function found';
        } else {
          const functionId = fnList[0].getId();
          task.title = `Function id is ${functionId}`;
          ctx.functions[params.index].id = functionId;
        }
      },
    },
    {
      title: `Create function "${params.fn.path}"`,
      task: async (ctx) => {
        const response = await operationClient.wait(
          await client.create({
            folderId: params.folderId,
            name: fnName,
            description: fnDescription,
          }),
          CreateFunctionMetadata
        );
        ctx.functions[params.index].id = response.getFunctionId();
      },
      skip: (ctx) => Boolean(ctx.functions[params.index].id),
    },
    {
      title: `Getting function "${params.fn.path}" revisions`,
      task: async (ctx, task) => {
        const response = await client.listVersions({
          functionId: ctx.functions[params.index].id,
        });
        const versionList = response.getVersionsList();
        ctx.functions[params.index].tagMap = versionList.reduce<
          Record<string, string[]>
        >((acc, version) => {
          acc[version.getId()] = version.getTagsList();
          return acc;
        }, {});
        task.title = `Got ${versionList.length} revisions`;
      },
      skip: (ctx) => !Boolean(ctx.functions[params.index].id),
    },
    {
      title: `Update function "${params.fn.path}"`,
      task: async (ctx, task) => {
        const tagMap = ctx.functions[params.index].tagMap || {};
        const allTags = Object.values(tagMap).reduce(
          (acc, tags) => [...acc, ...tags],
          []
        );
        const latestVersionEntry = Object.entries(tagMap).find(([, tags]) =>
          tags.includes('$latest')
        )!;
        // TODO: https://github.com/vitalets/yandex-cloud-lite/issues/1
        const resources = new Resources();
        resources.setMemory(128 * MiB);
        // TODO: https://github.com/vitalets/yandex-cloud-lite/issues/1
        const executionTimeout = new Duration();
        executionTimeout.setSeconds(5);
        const fnContent = await promisifiedReadFile(
          path.join(params.outputPath, params.fn.filename)
        );
        const packageJsonContent = JSON.stringify(
          getCloudPackageJson({
            name: params.fn.path,
            originalPackageJson: packageJson,
            usedDependencies: params.fn.externalModuleIds,
          })
        );
        const currentHashTag = getTagFromContent(fnContent, packageJsonContent);
        const nextVersionData = {
          functionId: ctx.functions[params.index].id,
          runtime: 'nodejs16',
          entrypoint: 'index.handler',
          resources: resources as any,
          executionTimeout: executionTimeout as any,
          tagList: [currentHashTag],
        };
        ctx.functions[params.index].tag = currentHashTag;
        if (!allTags.includes(currentHashTag)) {
          const zipBuffer = getZip([
            {
              name: 'index.js',
              content: fnContent,
            },
            {
              name: 'package.json',
              content: packageJsonContent,
            },
          ]);

          const response = await operationClient.wait(
            await client.createVersion({
              ...nextVersionData,
              content: zipBuffer,
            }),
            CreateFunctionVersionMetadata
          );
          const versionId = response.getFunctionVersionId();
          task.title = `Version ${versionId} created`;
        } else if (!latestVersionEntry[1].includes(currentHashTag)) {
          const versionEntry = Object.entries(tagMap).find(([, tags]) =>
            tags.includes(currentHashTag)
          );
          if (versionEntry === undefined) {
            throw new Error('Version entry is not found, weird');
          }
          const versionId = versionEntry[0];
          task.title = `Reverting to version ${versionId}..`;
          await operationClient.wait(
            await client.createVersion({
              ...nextVersionData,
              versionId,
            }),
            CreateFunctionVersionMetadata
          );
          task.title = `Reverted to version ${versionId}`;
        } else {
          const versionId = latestVersionEntry[0];
          task.skip(`Latest version ${versionId} is actual`);
        }
      },
    },
  ]);
}

type UpdateFunctionsParams = {
  session: Session;
  folderId: string;
  functions: ServerlessFunctionDescription[];
  outputPath: string;
};

function updateFunctions(params: UpdateFunctionsParams): Listr<DeployContext> {
  const client = params.session.createClient(FunctionServiceClient);
  const operationClient = new OperationService(params.session);
  return new Listr([
    {
      title: 'Verify previous functions',
      task: async (ctx) => {
        debugger;
        const functionList = (
          await client.list({
            folderId: params.folderId,
            pageSize: 100,
          })
        ).getFunctionsList();
        if (functionList.length === 100) {
          throw new Error("It's time to implement paging!");
        }
        ctx.leftoverFunctions = functionList
          .filter((fn) => {
            return !params.functions.some((nextFn) => {
              const fnName = getFunctionName(nextFn);
              return fnName === fn.getName();
            });
          })
          .map((fn) => ({
            id: fn.getId(),
            name: fn.getName(),
          }));
      },
    },
    {
      title: 'Remove unused functions',
      task: async (ctx) => {
        return new Listr<DeployContext>(
          ctx.leftoverFunctions.map((fn) => ({
            title: `Removing function "${fn.name}"`,
            task: async (_, task) => {
              await operationClient.wait(
                await client.delete({functionId: fn.id}),
                DeleteFunctionMetadata
              );
              task.title = `Function "${fn.name}" removed`;
            },
          }))
        );
      },
      skip: (ctx) => ctx.leftoverFunctions.length === 0,
    },
    {
      title: 'Update functions',
      task: async () =>
        new Listr<DeployContext>(
          params.functions.map((fn, index) => {
            return {
              title: `Function "${fn.path}"`,
              task: (ctx) => {
                ctx.functions[index] = {
                  id: '',
                  tag: '',
                  tagMap: {},
                };
                return updateFunction({
                  session: params.session,
                  fn,
                  index,
                  folderId: params.folderId,
                  outputPath: params.outputPath,
                });
              },
            };
          }),
          {
            concurrent: 3,
          }
        ),
    },
  ]);
}

type UpdateGatewayParams = {
  session: Session;
  folderId: string;
  gatewayName: string;
  objectStorage: {
    bucket: string;
    folder: string;
    serviceAccountId: string;
    publicFiles: string[];
  };
  functions: {
    descriptions: ServerlessFunctionDescriptionWithId[];
    serviceAccountId: string;
  };
};

function updateGateway(params: UpdateGatewayParams): Listr<DeployContext> {
  const client = params.session.createClient(ApiGatewayServiceClient);
  const operationClient = new OperationService(params.session);
  return new Listr([
    {
      title: 'Lookup fo existing gateway',
      task: async (ctx, task) => {
        const response = await client.list({
          folderId: params.folderId,
          filter: `name="${params.gatewayName}"`,
        });
        const list = response.getApiGatewaysList();
        if (list.length !== 0) {
          ctx.gateway.id = list[0].getId();
          task.skip('API gateway exists');
        } else {
          task.title = "Gateway doesn't exist";
        }
      },
    },
    {
      title: 'Spec generation',
      task: (ctx, task) => {
        ctx.gateway.nextSpec = getGatewayConfig({
          functions: params.functions,
          objectStorage: params.objectStorage,
        });
        task.title = 'Spec generated';
      },
    },
    {
      title: 'Update spec',
      task: async (ctx, task) => {
        const nextSpec = ctx.gateway.nextSpec!;
        if (!nextSpec) {
          throw new Error('Expected to have next spec');
        }
        if (ctx.gateway.id) {
          const prevSpec = jsYaml.load(
            (
              await client.getOpenapiSpec({apiGatewayId: ctx.gateway.id})
            ).getOpenapiSpec()
          ) as GatewayApiDocument;
          delete prevSpec.servers;
          if (!isEqual(clone(prevSpec), clone(nextSpec))) {
            await operationClient.wait(
              await client.update({
                apiGatewayId: ctx.gateway.id,
                name: params.gatewayName,
                description: `${params.gatewayName} gateway`,
                openapiSpec: jsYaml.dump(nextSpec),
              }),
              UpdateApiGatewayMetadata,
              {
                maxDelay: 5 * MINUTE,
              }
            );
            task.title = 'Spec updated';
          } else {
            task.skip('Spec has no changes');
          }
        } else {
          task.title = 'Creating gateway';
          const response = await operationClient.wait(
            await client.create({
              folderId: params.folderId,
              name: params.gatewayName,
              openapiSpec: jsYaml.dump(nextSpec),
            }),
            CreateApiGatewayMetadata
          );
          ctx.gateway.id = response.getApiGatewayId();
          task.title = 'Gateway created';
        }
        const response = await client.get({
          apiGatewayId: ctx.gateway.id,
        });
        ctx.gateway.url = response.getDomain();
      },
    },
  ]);
}

type UpdateStorageParams = {
  folderToUpdate: string;
  bucket: string;
  serviceAccountId: string;
  manifest: Manifest;
  outputPath: string;
  credentials: CredentialsOptions;
};

function updateStorage(params: UpdateStorageParams): Listr<DeployContext> {
  const s3Provider = new AWS.S3({
    endpoint: 's3.yandexcloud.net',
    region: 'unknown',
    credentials: params.credentials,
  });
  return new Listr([
    {
      title: 'Creating bucket',
      task: async (ctx, task) => {
        try {
          await s3Provider
            .createBucket({
              Bucket: params.bucket,
              ACL: 'private',
            })
            .promise();
          task.title = 'Bucket created';
        } catch (e: unknown) {
          if ((e as any).code !== 'BucketAlreadyOwnedByYou') {
            throw e;
          }
          ctx.objectStorage.shouldSkipACLUpdate = true;
          task.skip('Bucket exists');
        }
      },
    },
    {
      title: 'Updating bucket ACL',
      task: async (_, task) => {
        await s3Provider
          .putBucketAcl({
            Bucket: params.bucket,
            AccessControlPolicy: {
              Grants: [
                {
                  Grantee: {
                    ID: params.serviceAccountId,
                    DisplayName: 'serviceAccount',
                    Type: 'serviceAccount',
                  },
                  Permission: 'WRITE',
                },
              ],
            },
          })
          .promise();
        task.title = 'Bucket ACL updated';
      },
      skip: (ctx) => Boolean(ctx.objectStorage.shouldSkipACLUpdate),
    },
    {
      title: 'Verifying public',
      task: async (ctx, task) => {
        const localFiles = (await promisifiedWalk(paths.publicDir)).filter(
          (entry) => entry.dirent.isFile()
        );
        const localMd5Map = await Promise.all(
          localFiles.map(async (entry) => ({
            name: entry.name,
            md5: await md5File(entry.path),
          }))
        );
        const remoteFiles = (
          await s3Provider
            .listObjectVersions({
              Bucket: params.bucket,
              Prefix: 'public/',
            })
            .promise()
        ).Versions!.filter((version) => version.Size !== 0);
        const remoteMd5Map = remoteFiles.map((remoteFile) => ({
          name: remoteFile.Key!.replace(/^public\//, ''),
          md5: remoteFile.ETag?.replace(/"/g, ''),
        }));
        const filesToAdd = localMd5Map
          .filter(
            ({name: localName}) =>
              !remoteMd5Map.some(
                ({name: remoteName}) => remoteName === localName
              )
          )
          .map(({name}) => name);
        const filesToRemove = remoteMd5Map
          .filter(
            ({name: remoteName}) =>
              !localMd5Map.some(({name: localName}) => localName === remoteName)
          )
          .map(({name}) => name);
        const changedFiles = localMd5Map
          .filter(({name, md5: localMd5}) => {
            const match = remoteMd5Map.find(
              ({name: remoteName}) => remoteName === name
            );
            if (!match) {
              return;
            }
            return match.md5 !== localMd5;
          })
          .map(({name}) => name);
        ctx.objectStorage.publicFiles = localMd5Map.map(({name}) => name);
        if (
          filesToAdd.length === 0 &&
          filesToRemove.length === 0 &&
          changedFiles.length === 0
        ) {
          task.skip('Public folder is up-to-date');
          return;
        }
        return new Listr<DeployContext>(
          [
            ...filesToAdd.map((fileToAdd) => ({
              title: `Add file "${fileToAdd}"`,
              task: async (_, task) => {
                const match = localMd5Map.find(({name}) => name === fileToAdd)!;
                await s3Provider
                  .putObject({
                    Bucket: params.bucket,
                    Key: `public/${fileToAdd}`,
                    Body: await promisifiedReadFile(
                      path.join(paths.publicDir, fileToAdd)
                    ),
                    ContentType: getContentTypeByFilename(fileToAdd),
                    ContentMD5: match.md5,
                  })
                  .promise();
                task.title = `File "${fileToAdd}" added`;
              },
            })),
            ...filesToRemove.map((fileToRemove) => ({
              title: `Remove file "${fileToRemove}"`,
              task: async (_, task) => {
                await s3Provider
                  .deleteObject({
                    Bucket: params.bucket,
                    Key: `public/${fileToRemove}`,
                  })
                  .promise();
                task.title = `File "${fileToRemove}" removed`;
              },
            })),
            ...changedFiles.map((fileToUpdate) => ({
              title: `Update file "${fileToUpdate}"`,
              task: async (_, task) => {
                const match = localMd5Map.find(
                  ({name}) => name === fileToUpdate
                )!;
                await s3Provider
                  .putObject({
                    Bucket: params.bucket,
                    Key: `public/${fileToUpdate}`,
                    Body: await promisifiedReadFile(
                      path.join(paths.publicDir, fileToUpdate)
                    ),
                    ContentType: getContentTypeByFilename(fileToUpdate),
                    ContentMD5: match.md5,
                  })
                  .promise();
                task.title = `File "${fileToUpdate}" updated`;
              },
            })),
          ],
          {
            concurrent: 3,
          }
        );
      },
    },
    {
      title: 'Looking up objects',
      task: async (ctx, task) => {
        const response = await s3Provider
          .listObjectsV2({
            Bucket: params.bucket,
            Prefix: `${params.folderToUpdate}/`,
          })
          .promise();
        const objects = response.Contents ?? [];
        if (objects.length !== 0) {
          ctx.objectStorage.shouldSkipUpload = true;
          task.skip(`Already has files in "${params.folderToUpdate}" folder`);
        }
      },
    },
    {
      title: `Uploading objects to "${params.folderToUpdate}"`,
      task: async () => {
        const values = ['manifest.json', ...Object.values(params.manifest)];
        return new Listr(
          values.map((value) => ({
            title: `Uploading file ${value}`,
            task: async () => {
              const fileBuffer = await promisifiedReadFile(
                path.join(params.outputPath, value)
              );
              await s3Provider
                .putObject({
                  Bucket: params.bucket,
                  Key: `${params.folderToUpdate}/${value}`,
                  Body: fileBuffer,
                  ContentType: getContentTypeByFilename(value),
                })
                .promise();
            },
          })),
          {
            concurrent: 3,
          }
        );
      },
      skip: (ctx) => Boolean(ctx.objectStorage.shouldSkipUpload),
    },
  ]);
}

async function getClientWebpack(): Promise<ClientWebpackResult> {
  const compiler = webpack(clientEntry);
  const stats = await util.promisify(compiler.run).bind(compiler)();
  const jsonStats = stats?.toJson();
  if (!jsonStats) {
    throw new Error('No stats provided by webpack');
  }
  if (jsonStats.errors && jsonStats.errors.length !== 0) {
    throw new Error(
      `Client webpack build errors:\n${jsonStats.errors
        .map((error) => error.message)
        .join('\n')}`
    );
  }
  const outputPath = jsonStats.outputPath;
  if (!outputPath) {
    throw new Error('No output path provided by webpack');
  }
  const hash = jsonStats.hash;
  if (!hash) {
    throw new Error('No hash provided by webpack');
  }
  const manifest = JSON.parse(
    (
      await promisifiedReadFile(path.join(outputPath, 'manifest.json'))
    ).toString('utf8')
  );
  return {
    storageFolder: hash,
    outputPath,
    manifest,
  };
}

async function getServerWebpack(): Promise<ServerWebpackResult> {
  const compiler = webpack(serverEntry);
  const stats = await util.promisify(compiler.run).bind(compiler)();
  const jsonStats = stats?.toJson();
  if (!jsonStats) {
    throw new Error('No stats provided by webpack');
  }
  if (jsonStats.errors && jsonStats.errors.length !== 0) {
    throw new Error(
      `Server webpack build errors:\n${jsonStats.errors
        .map((error) => error.message)
        .join('\n')}`
    );
  }
  const outputs = Object.entries(jsonStats.assetsByChunkName || {}).map(
    ([key, value]) => {
      const mainChunk = value[0];
      if (!jsonStats.assets) {
        throw new Error('No assets in stats');
      }
      const asset = jsonStats.assets.find((asset) => asset.name === mainChunk);
      if (!asset) {
        throw new Error(`Asset for ${mainChunk} not found`);
      }
      const chunkIds = asset.chunks || [];
      if (!jsonStats.chunks) {
        throw new Error('No chunks in stats');
      }
      const chunks = jsonStats.chunks.filter(
        (chunk) => chunk.id !== undefined && chunkIds.includes(chunk.id)
      );
      const chunkHashes = chunks.map((chunk) => chunk.hash);
      const externalModuleIds = chunks.reduce<string[]>((acc, chunk) => {
        function getModuleIdentifiers(
          chunkOrModule: StatsChunk | StatsModule
        ): string[] {
          return (chunkOrModule.modules || []).reduce<string[]>(
            (acc, module) => {
              return [
                ...acc,
                module.identifier || 'unknown',
                ...getModuleIdentifiers(module),
              ];
            },
            []
          );
        }
        const allIdentifiers = getModuleIdentifiers(chunk);
        return [
          ...acc,
          ...allIdentifiers
            .filter((identifier) => identifier.includes('external'))
            .map((identifier) => identifier.match(/"(.*)"/)?.[1])
            .filter((match): match is string => Boolean(match))
            .map((match) =>
              match.startsWith('@') ? match : match.split('/')[0]
            ),
        ];
      }, []);
      return {
        path: key,
        filename: mainChunk,
        hash: chunkHashes.join(';'),
        externalModuleIds: Array.from(new Set(externalModuleIds)),
        // TODO: сделать правильно
        methods: ['GET'],
      };
    }
  );
  const outputPath = jsonStats.outputPath;
  if (!outputPath) {
    throw new Error('No output path provided by webpack');
  }
  return {
    outputPath,
    functionDescriptions: outputs,
  };
}

async function run() {
  // Constants
  const bucketName = 'static-hin-ru';
  const gatewayName = 'main';

  const folderId = validateVariable('CLOUD_FOLDER_ID');
  const accessKeyId = validateVariable('CLOUD_S3_ACCESS_KEY_ID');
  const secretAccessKey = validateVariable('CLOUD_S3_SECRET_ACCESS_KEY');
  const credentials = {
    accessKeyId,
    secretAccessKey,
  };

  const listr = new Listr<DeployContext>(
    [
      {
        title: 'Webpack',
        task: () => {
          return new Listr(
            [
              {
                title: 'Client webpack',
                task: async (ctx) => {
                  await tryCleanDir(path.join(paths.build, 'client'));
                  ctx.clientWebpack = await getClientWebpack();
                },
              },
              {
                title: 'Server webpack',
                task: async (ctx) => {
                  await tryCleanDir(path.join(paths.build, 'server'));
                  ctx.serverWebpack = await getServerWebpack();
                },
              },
            ],
            {
              concurrent: true,
            }
          );
        },
      },
      {
        title: 'Yandex Cloud session',
        task: async (ctx) => {
          const authFileName = '.auth-key.deploy.json';
          const filePath = path.join(paths.root, authFileName);
          let serviceAccountId;
          try {
            const file = JSON.parse(fs.readFileSync(filePath).toString('utf8'));
            serviceAccountId = file.service_account_id;
          } catch (e) {
            throw new Error(
              `File ${authFileName} in root dir not found, please refer to example file`
            );
          }
          if (!serviceAccountId) {
            throw new Error(`No service account id in file ${authFileName}`);
          }

          ctx.auth = {
            session: new Session({authKeyFile: filePath}),
            serviceAccountId,
          };
        },
      },
      {
        title: 'S3 static',
        task: (ctx) => {
          if (!ctx.clientWebpack) {
            throw new Error('Client webpack needed to update storage');
          }
          if (!ctx.auth) {
            throw new Error('Auth needed to update storage');
          }
          return updateStorage({
            bucket: bucketName,
            folderToUpdate: ctx.clientWebpack.storageFolder,
            manifest: ctx.clientWebpack.manifest,
            outputPath: ctx.clientWebpack.outputPath,
            serviceAccountId: ctx.auth.serviceAccountId,
            credentials,
          });
        },
      },
      {
        title: 'Cloud functions',
        task: (ctx) => {
          if (!ctx.serverWebpack) {
            throw new Error('Server webpack needed to update functions');
          }
          if (!ctx.auth) {
            throw new Error('Auth needed to update functions');
          }
          return updateFunctions({
            session: ctx.auth.session,
            folderId: ctx.folderId,
            functions: ctx.serverWebpack.functionDescriptions,
            outputPath: ctx.serverWebpack.outputPath,
          });
        },
      },
      {
        title: 'API gateway',
        task: (ctx) => {
          if (!ctx.clientWebpack) {
            throw new Error('Client webpack needed to update gateway');
          }
          if (!ctx.serverWebpack) {
            throw new Error('Server webpack needed to update gateway');
          }
          if (!ctx.auth) {
            throw new Error('Auth needed to update gateway');
          }
          if (!ctx.objectStorage.publicFiles) {
            throw new Error('Public files needed to update gateway');
          }
          return updateGateway({
            session: ctx.auth.session,
            folderId: ctx.folderId,
            gatewayName,
            objectStorage: {
              bucket: bucketName,
              folder: ctx.clientWebpack.storageFolder,
              serviceAccountId: ctx.auth.serviceAccountId,
              publicFiles: ctx.objectStorage.publicFiles,
            },
            functions: {
              descriptions: ctx.serverWebpack.functionDescriptions.map(
                (description, index) => ({
                  ...description,
                  id: ctx.functions[index].id!,
                  tag: ctx.functions[index].tag!,
                })
              ),
              serviceAccountId: ctx.auth.serviceAccountId,
            },
          });
        },
      },
      {
        title: 'Link',
        task: (ctx, task) => {
          task.title = `API gateway link: ${ctx.gateway.url}`;
        },
      },
    ],
    {
      rendererOptions: {
        collapse: false,
      },
      rendererSilent: Boolean(process.env.SILENT),
    }
  );
  await listr.run({
    folderId,
    objectStorage: {},
    functions: [],
    leftoverFunctions: [],
    gateway: {},
  });
}

run().catch((e) => {
  console.error('Error on deploy');
  console.error(e);
  process.exit(1);
});

export {};
