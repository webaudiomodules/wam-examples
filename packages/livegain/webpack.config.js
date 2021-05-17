const path = require('path');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const { mode } = argv;
  /** @type {import('webpack').Configuration} */
  const config = {
    entry: {
      livegain: `./src/livegain/index.tsx`,
      oscilloscope: `./src/oscilloscope/index.tsx`,
      spectroscope: `./src/spectroscope/index.tsx`,
      spectrogram: `./src/spectrogram/index.tsx`,
    },
    resolve: {
      fallback: {
        "path": require.resolve("path"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "fs": false,
        // "stream": require.resolve("stream-browserify")
      },
      extensions: ['.tsx', '.ts', '.js']
    },
    node: {
    },
    experiments: {
        outputModule: true
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      // library: 'JSPatcher',
      libraryTarget: 'module',
      // chunkFilename: 'js/[chunkhash].js'
    },
    module: {
      rules: [{
          test: /\.worklet\.(ts|js)$/,
          use: [{
            loader: 'worklet-loader',
            options: {
              name: '[fullhash].worklet.js'
            }
          }],
          exclude: /node_modules/
        }, {
          test: /\.(ts|js)x?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        }
      ]
    },
    plugins: [
      new DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
        },
        'process.platform': {}
      }),
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: `./src/livegain/descriptor.json`, to: './livegain/' },
          { from: `./src/oscilloscope/descriptor.json`, to: './oscilloscope/' },
          { from: `./src/spectroscope/descriptor.json`, to: './spectroscope/' },
          { from: `./src/spectrogram/descriptor.json`, to: './spectrogram/' }
        ]
      }),
    ]
  };
  if (mode === 'development') {
    config.devtool = 'source-map';
    config.output.filename = './[name]/index.js';
  }
  if (mode === 'production') {
    config.devtool = 'source-map';
    config.output.filename = './[name]/index.min.js';
  }
  return config;
};