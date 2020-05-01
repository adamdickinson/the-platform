const {DefinePlugin} = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const env = {};
const envEntries = Object.entries(require('dotenv').config().parsed).forEach(
  ([key, value]) => {
    env[`process.env.${key}`] = JSON.stringify(value); // We stringify because webpack
  },
);

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',

  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },

  devtool: 'source-map',

  devServer: {
    host: '0.0.0.0',
    contentBase: path.resolve('dist'),
    compress: true,
    disableHostCheck: true,
    historyApiFallback: true,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  plugins: [
    new DefinePlugin(env),
    new HtmlWebpackPlugin({
      title: 'The Voting Platform',
      appMountId: 'root',
      template: 'src/index.html',
    }),
  ],
};
