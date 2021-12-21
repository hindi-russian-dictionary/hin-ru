import express from 'express';
import util from 'util';
import path from 'path';
import * as fsWalk from '@nodelib/fs.walk';

import {ServerlessModule} from 'server/types/serverless';
import {paths} from 'server/lib/paths';
import {convertHandlerToMiddleware} from 'server/utils/express-serverless';

const app = express();
// Не тратим силы на парсинг query, которую не будем использовать
app.set('query parser', false);
app.use(express.json());

const promisifiedWalk = util.promisify(fsWalk.walk);

let routesApplied = false;
const applyRoutes = async () => {
  if (routesApplied) {
    return;
  }
  const serverlessDir = path.join(paths.server, 'serverless');
  const entries = await promisifiedWalk(serverlessDir);
  const handlers = entries
    .filter((entry) => entry.dirent.isFile())
    .map((entry) => {
      const module = require(entry.path) as ServerlessModule;
      const extname = path.extname(entry.name);
      const relativeName = path
        .relative(serverlessDir, entry.path)
        .slice(0, -extname.length);
      return {
        path: relativeName === 'index' ? '*' : `/${relativeName}/`,
        module,
      };
    })
    .sort((a, b) => {
      // '*' goes last
      if (a.path === '*') {
        return 1;
      }
      if (b.path === '*') {
        return -1;
      }
      return 0;
    });
  handlers.forEach(({path, module}) => {
    app.all(path + '?*', convertHandlerToMiddleware(path, module.handler));
  });
  routesApplied = true;
};

export const getApp = async () => {
  await applyRoutes();
  return app;
};
