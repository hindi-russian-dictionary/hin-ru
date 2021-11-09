import 'server/lib/dotenv';
import * as path from 'path';
import * as webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import glob from 'glob-promise';
import * as ts from 'typescript';

import {getWebpackConfig} from 'tools/webpack/get-webpack-config';
import {paths} from 'server/lib/paths';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

type ResolvePluginInstance = Exclude<
  NonNullable<webpack.ResolveOptions['plugins']>[number],
  '...'
>;
type Resolver = Parameters<ResolvePluginInstance['apply']>[0];

class IgnoreAliasPlugin implements ResolvePluginInstance {
  alias: RegExp;

  constructor(alias: RegExp) {
    this.alias = alias;
  }

  apply(resolver: Resolver): void {
    resolver
      .getHook('resolve')
      .tapAsync('IgnoreAliasPlugin', (request, resolveContext, callback) => {
        const innerRequest = request.request || request.path;
        if (!innerRequest) {
          return callback();
        }
        if (this.alias.test(innerRequest)) {
          return callback(null, {...request, path: false});
        }
        return callback();
      });
  }
}

const config = getWebpackConfig('server', {
  target: 'node',
  entry: async () => {
    const rootPath = path.join(paths.server, 'serverless/functions');
    const files = await glob(path.join(rootPath, '**/*.ts'));
    return files.reduce((acc, file) => {
      const extname = path.extname(file);
      const relativePath = path
        .relative(rootPath, file)
        .slice(0, -extname.length);
      return {
        ...acc,
        [relativePath]: file,
      };
    }, {});
  },
  output: {
    path: path.join(paths.build, 'server'),
    library: {
      type: 'commonjs',
    },
    filename: '[name].js',
  },
  externals: [nodeExternals()],
  externalsPresets: {
    node: true,
  },
  compilerOptions: {
    target: ts.ScriptTarget.ESNext,
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(paths.root, 'tsconfig.json'),
      }),
      new IgnoreAliasPlugin(/\.(png|css)/),
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_DATABASE_URL',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_MEASUREMENT_ID',
    ]),
  ],
  optimization: {
    minimize: false,
  },
});

export default config;
