import 'server/lib/dotenv';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware, {Context} from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import 'server/lib/ignore-extensions';
import clientEntry from 'tools/webpack/client';
import {paths} from 'server/lib/paths';
import {setCleanupWatcher, setWebpackWatcher} from 'tools/watch-utils';

const compiler = webpack(clientEntry);
const app = express();

const devMiddleware = webpackDevMiddleware(compiler, {
  serverSideRender: true,
  publicPath: '/static/',
});
app.use(devMiddleware);
app.use(webpackHotMiddleware(compiler as any));

const entryPointPath = path.join(paths.server, 'app.ts');

app.use(express.static(paths.publicDir));

app.use((req, res, next) => {
  const devMiddleware: Context = res.locals.webpack.devMiddleware;
  const outputFileSystem = devMiddleware.outputFileSystem;
  if (!devMiddleware.stats) {
    return res.sendStatus(500);
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
      res.locals.manifest = JSON.parse(result!.toString('utf8'));
      next();
    }
  );
});

app.use(async (req, res, next) => {
  const {getApp} = await import(entryPointPath);
  const app = await getApp();
  app(req, res, next);
});

setCleanupWatcher(paths.server, paths.root, entryPointPath);
setWebpackWatcher(compiler, /[\/\\]client[\/\\]/);

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`HTTP service started at port ${port}`);
});
