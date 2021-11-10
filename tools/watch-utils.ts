import path from 'path';
import chokidar from 'chokidar';
import * as webpack from 'webpack';

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

export const setCleanupWatcher = (
  watchPath: string,
  rootPath: string,
  entryPointPath: string
) => {
  const watcher = chokidar.watch(watchPath);
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
              .map((id) => path.relative(rootPath, id))
              .join(', ')}`
          );
          clearCacheModules.forEach((moduleId) => {
            delete require.cache[moduleId];
          });
      }
    });
  });
};

export const setWebpackWatcher = (
  compiler: webpack.Compiler,
  cleanupRegex: RegExp
): void => {
  compiler.hooks.done.tap('BuildStatsPlugin', () => {
    // TODO: сейчас самый последний очищаемый модуль - client/entries/server.tsx
    // Однако, чтобы SSR тоже обновился - надо очистить всё вплоть до server/app.ts
    console.log('Clearing /client/ module cache from server');
    Object.keys(require.cache).forEach((id) => {
      if (cleanupRegex.test(id)) {
        delete require.cache[id];
      }
    });
  });
};
