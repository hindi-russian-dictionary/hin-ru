import 'tools/dotenv';
import * as webpack from 'webpack';
import {getWebpackConfig} from 'tools/get-webpack-config';
import {mode} from 'tools/mode';

const ENTRY_NAMES = ['server', 'client'] as const;
type Entry = typeof ENTRY_NAMES[number];

function isEntryName(input: unknown): input is Entry {
  return ENTRY_NAMES.includes(input as Entry);
}

const userEntryNames = (process.env.ENTRIES || '')
  .split(',')
  .filter(isEntryName);
const entryNames = userEntryNames.length === 0 ? ENTRY_NAMES : userEntryNames;

const serverEntry = getWebpackConfig({
  mode,
  target: 'node',
  entry: './server/index.ts',
  output: {
    path: 'build/server',
  },
  tsconfigPath: 'tsconfig.json',
});

export const clientEntry = getWebpackConfig({
  mode,
  target: 'web',
  entry: [
    mode === 'production' ? undefined : 'webpack-hot-middleware/client',
    './client/index.tsx',
  ].filter((x): x is string => Boolean(x)),
  output: {
    path: 'build/client',
    publicPath: mode === 'production' ? undefined : '/static/',
  },
  tsconfigPath: 'client/tsconfig.json',
});

const ENTRIES: Record<Entry, webpack.Configuration> = {
  server: serverEntry,
  client: clientEntry,
};

export default entryNames.map((name) => ENTRIES[name]);
