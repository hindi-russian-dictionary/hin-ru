import path from 'path';

const root = path.join(__dirname, '..');
const server = path.join(root, 'server');
const client = path.join(root, 'client');
const build = path.join(root, 'build');
const publicDir = path.join(root, 'public');

export const paths = {
  root,
  server,
  client,
  build,
  publicDir,
};
