var webpack = require('webpack')
var path = require('path')
module.exports = {
  entry: {
    app: ['./index.js']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'app-bundle.js',
    publicPath: '/dist/'
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
        loader: 'babel-loader',
        query: {
          plugins: ['transform-async-to-generator', 'meaningful-logs']
        }
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        worker: {
          output: {
            filename: 'worker.js',
            chunkFilename: '[id].worker.js'
          }
        }
      }
    })
  ]
  //watch: true
}