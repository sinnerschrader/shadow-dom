const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: ['./src.js'],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.html?$/,
        loader: 'raw-loader'
      }
    ],
  },
  output: {
    filename: 'browser.js'
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
