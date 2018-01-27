const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: ['./src/shadow-dom.js'],
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
    filename: 'shadow-dom.bundle.js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '/lib')
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
