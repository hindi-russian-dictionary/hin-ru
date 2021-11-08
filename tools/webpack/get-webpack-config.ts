import * as webpack from 'webpack';
import * as ts from 'typescript';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';

import {mode, Mode} from 'server/lib/mode';

type Config = {
  target: 'web' | 'node';
  customBeforeTransformers?: (
    | ts.TransformerFactory<ts.SourceFile>
    | undefined
  )[];
} & Omit<Partial<webpack.Configuration>, 'target' | 'mode'>;
type ConfigOrConfigFn = Config | ((mode: Mode) => Config);

export const getWebpackConfig = (
  configOrConfigFn: ConfigOrConfigFn
): webpack.Configuration => {
  const {customBeforeTransformers, ...config} =
    typeof configOrConfigFn === 'function'
      ? configOrConfigFn(mode)
      : configOrConfigFn;
  const isProduction = mode === 'production';
  return {
    devtool: isProduction ? undefined : 'cheap-module-source-map',
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
    ],
    cache: {
      type: 'filesystem',
    },
  };
};
