import 'tools/dotenv';
import chokidar from 'chokidar';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware, {Context} from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {Manifest} from 'webpack-manifest-plugin';
import path from 'path';

import 'tools/ignore-extensions';
import {clientEntry} from 'tools/webpack.config';
import {manifestUtils} from 'server/lib/manifest-utils';
import {renderApp} from 'server/react/html';
import {paths} from 'tools/paths';
import {mode} from 'tools/mode';

const compiler = webpack(clientEntry);
const app = express();

const devMiddleware = webpackDevMiddleware(compiler, {
  serverSideRender: true,
  publicPath: clientEntry.output!.publicPath as string,
});
app.use(devMiddleware);
app.use(webpackHotMiddleware(compiler as any));

app.use(async (req, res, next) => {
  const appModule = await import(entryPointPath);
  appModule.app(req, res, next);
});

const entryPointPath = path.join(paths.server, 'app.ts');
app.use((req, res, next) => {
  const devMiddleware: Context = res.locals.webpack.devMiddleware;
  const outputFileSystem = devMiddleware.outputFileSystem;
  if (!devMiddleware.stats) {
    return next();
  }
  const jsonStats = devMiddleware.stats.toJson();
  const manifestAsset = (jsonStats.assets || []).find(
    (asset) => asset.name === 'manifest.json'
  );

  outputFileSystem.readFile(
    path.join(jsonStats.outputPath!, manifestAsset!.name),
    (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      const manifest: Manifest = JSON.parse(result!.toString('utf8'));
      const app = renderApp({
        scripts: manifestUtils.getScripts(manifest),
        location: req.url,
        mode,
      });
      res.send(app);
    }
  );
});

const getAllDependencies = (
  allModules: NodeJS.Dict<NodeJS.Module>,
  lookupModule: NodeJS.Module,
  finalModuleFilename: string,
  taggedModuleIds: string[] = []
): string[] => {
  return Object.entries(allModules).reduce((acc, [moduleId, module]) => {
    if (!module) {
      return acc;
    }
    if (module.children.includes(lookupModule)) {
      if (!acc.includes(moduleId)) {
        acc.push(moduleId);
        if (module.filename !== finalModuleFilename) {
          getAllDependencies(allModules, module, finalModuleFilename, acc);
        }
      }
    }
    return acc;
  }, taggedModuleIds);
};

const watcher = chokidar.watch(paths.server);
watcher.on('ready', () => {
  watcher.on('all', (event, filepath) => {
    switch (event) {
      case 'change':
      case 'add':
      case 'unlink':
        const cachedModule = require.cache[filepath];
        if (!cachedModule) {
          return;
        }
        const clearCacheModules = [
          cachedModule.id,
          ...getAllDependencies(require.cache, cachedModule, entryPointPath),
        ];
        console.log(
          `Clearing modules cache: ${clearCacheModules
            .map((id) => path.relative(paths.root, id))
            .join(', ')}`
        );
        clearCacheModules.forEach((moduleId) => {
          delete require.cache[moduleId];
        });
    }
  });
});

compiler.hooks.done.tap('BuildStatsPlugin', () => {
  console.log('Clearing /client/ module cache from server');
  Object.keys(require.cache).forEach((id) => {
    if (/[\/\\]client[\/\\]/.test(id)) {
      delete require.cache[id];
    }
  });
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`HTTP service started at port ${port}`);
});
