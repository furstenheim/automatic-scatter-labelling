var webpack = require('webpack')
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
var path = require('path')
module.exports = {
  entry: {
    app: ['./index.js']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'app-bundle.js',
    publicPath: '/dist'
  },
  devServer: {
    contentBase: './',
    port: 8000
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [path.join(__dirname, 'index'), path.join(__dirname, 'src')],
        loader: 'babel',
        query: {
          plugins: ['transform-async-to-generator', 'lodash', 'transform-es2015-modules-commonjs', 'meaningful-logs']
        }
      }
    ]
  },
  'plugins': [
    new LodashModuleReplacementPlugin,
    new webpack.optimize.OccurrenceOrderPlugin
  ]
  //watch: true
}