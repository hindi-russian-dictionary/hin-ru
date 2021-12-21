import 'server/lib/dotenv';
import path from 'path';
import * as webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';

import {getWebpackConfig} from 'tools/webpack/get-webpack-config';
import {paths} from 'server/lib/paths';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config = getWebpackConfig((mode) => {
  const isProduction = mode === 'production';
  return {
    target: 'web',
    project: 'client',
    entry: [
      isProduction ? undefined : 'webpack-hot-middleware/client',
      './client/index.tsx',
    ].filter((x): x is string => Boolean(x)),
    output: {
      path: path.join(paths.build, 'client'),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProduction
        ? '[name].[contenthash:8].chunk.js'
        : '[name].chunk.js',
      assetModuleFilename: isProduction
        ? 'media/[hash][ext][query]'
        : 'media/[name][ext][query]',
    },
    resolve: {
      extensions: ['.css', '.png'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.join(paths.root, 'client/tsconfig.json'),
        }),
      ],
    },
    customBeforeTransformers: [
      isProduction ? undefined : ReactRefreshTypeScript(),
    ],
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [
      isProduction ? undefined : new webpack.HotModuleReplacementPlugin(),
      isProduction ? undefined : new webpack.NoEmitOnErrorsPlugin(),
      isProduction ? undefined : new ReactRefreshWebpackPlugin(),
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
    ].filter((x): x is webpack.WebpackPluginInstance => Boolean(x)),
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png)$/,
          type: 'asset/resource',
        },
      ],
    },
  };
});

export default config;
