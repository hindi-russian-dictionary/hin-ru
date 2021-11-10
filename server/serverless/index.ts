import {Manifest} from 'webpack-manifest-plugin';
import crossFetch from 'cross-fetch';

import {renderApp} from 'server/react/html';
import {mode} from 'server/lib/mode';
import {ServerlessEvent, ServerlessHandler} from 'server/types/serverless';

export type OperationContext = {
  objectStorage: {
    bucket: string;
    folder: string;
  };
};

const getManifest = async (event: ServerlessEvent): Promise<Manifest> => {
  if (mode === 'production') {
    const {objectStorage} = event.requestContext.apiGateway!
      .operationContext as OperationContext;
    const response = await crossFetch(
      `https://storage.yandexcloud.net/${objectStorage.bucket}/${objectStorage.folder}/manifest.json`
    );
    return response.json();
  }
  return event.locals.manifest;
};

const getScripts = (manifest: Manifest): string[] => {
  return [manifest['main']].map((entry) => `/static/${entry}`);
};

export const handler: ServerlessHandler = async (event) => {
  const manifest = await getManifest(event);
  const scripts = getScripts(manifest);
  const app = renderApp({
    scripts,
    location: event.url,
    mode,
  });
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
    body: app,
  };
};
