import fs from 'fs';
import {Manifest} from 'webpack-manifest-plugin';

const getManifest = (path: string): Manifest => {
  try {
    const manifestRaw = fs.readFileSync(path).toString('utf8');
    return JSON.parse(manifestRaw) as Manifest;
  } catch (e) {
    throw new Error(`Manifest could not be resolved\n${String(e)}`);
  }
};

const getScripts = (manifest: Manifest): string[] => {
  // Добавлять в начало / - плохое решение, но пока рабочее
  return [manifest['main.js']].map((script) =>
    script.startsWith('/') ? script : `/${script}`
  );
};

export const manifestUtils = {
  getManifest,
  getScripts,
};
