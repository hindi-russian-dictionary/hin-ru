import * as path from 'path';
import * as webpack from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';

import {Mode} from 'tools/mode';

const base = path.resolve(__dirname, '..');

type Config = {
  mode: Mode;
  target: 'web' | 'node';
  entry: string | string[];
  output: {
    path: string;
    publicPath?: string;
  };
  tsconfigPath: string;
};
export const getWebpackConfig = (config: Config): webpack.Configuration => {
  const isProduction = config.mode === 'production';
  return {
    mode: config.mode,
    target: config.target,
    entry: config.entry,
    output: {
      path: path.resolve(base, config.output.path),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProduction
        ? '[name].[contenthash:8].chunk.js'
        : '[name].chunk.js',
      assetModuleFilename: isProduction
        ? 'media/[hash][ext][query]'
        : 'media/[name][ext][query]',
      publicPath: config.output.publicPath,
    },
    devtool: isProduction ? undefined : 'cheap-module-source-map',
    resolve: {
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(base, config.tsconfigPath),
        }),
      ],
      extensions: ['.ts', '.tsx', '.js', '.css', '.png'],
    },
    plugins: [
      isProduction ? undefined : new webpack.HotModuleReplacementPlugin(),
      isProduction ? undefined : new webpack.NoEmitOnErrorsPlugin(),
      isProduction ? undefined : new ReactRefreshWebpackPlugin(),
      new WebpackManifestPlugin({
        publicPath: config.output.publicPath,
        filter: (file) => !file.name.endsWith('.map'),
      }),
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
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                getCustomTransformers: () => ({
                  before: [
                    isProduction ? undefined : ReactRefreshTypeScript(),
                  ].filter(Boolean),
                }),
                transpileOnly: !isProduction,
              },
            },
          ],
        },
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
    optimization: {
      minimize: isProduction,
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  };
};
