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
    ]
  },
  output: {
    filename: 'browser.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
