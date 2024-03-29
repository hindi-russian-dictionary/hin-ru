import * as webpack from 'webpack';
import * as ts from 'typescript';
import * as path from 'path';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
import {StatsWriterPlugin} from 'webpack-stats-plugin';

import {mode, Mode} from 'server/lib/mode';
import {paths} from 'server/lib/paths';

type Config = {
  target: 'web' | 'node';
  customBeforeTransformers?: (
    | ts.TransformerFactory<ts.SourceFile>
    | undefined
  )[];
  project: string;
  compilerOptions?: ts.CompilerOptions;
} & Omit<Partial<webpack.Configuration>, 'target' | 'mode'>;
type ConfigOrConfigFn = Config | ((mode: Mode) => Config);

export const getWebpackConfig = (
  configOrConfigFn: ConfigOrConfigFn
): webpack.Configuration => {
  const {customBeforeTransformers, compilerOptions, project, ...config} =
    typeof configOrConfigFn === 'function'
      ? configOrConfigFn(mode)
      : configOrConfigFn;
  const isProduction = mode === 'production';
  return {
    devtool: 'source-map',
    ...config,
    mode,
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
                  before: (customBeforeTransformers || []).filter(Boolean),
                }),
                transpileOnly: !isProduction,
                onlyCompileBundledFiles: true,
                compilerOptions,
              },
            },
          ],
        },
        ...(config.module?.rules ?? []),
      ],
    },
    resolve: {
      ...config.resolve,
      extensions: ['.ts', '.tsx', '.js', ...(config.resolve?.extensions || [])],
    },
    optimization: {
      minimize: isProduction,
      ...config.optimization,
    },
    plugins: [
      new WebpackManifestPlugin({
        publicPath: config.output?.publicPath as string | undefined,
        filter: (file) => !file.name.endsWith('.map'),
        useEntryKeys: true,
      }),
      ...(config.plugins || []),
      new StatsWriterPlugin({
        filename: 'stats.json',
        stats: 'all',
      }) as unknown as webpack.WebpackPluginInstance,
    ],
    cache: {
      type: 'filesystem',
      cacheDirectory: path.join(
        paths.root,
        `node_modules/.cache/webpack/${project}`
      ),
    },
  };
};
