var webpack = require('webpack')
var path = require('path')
var libraryName = 'automatic-scatter-labelling'
module.exports = {
  entry: {
    app: ['./index.js']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: libraryName + '.js',
    library: 'automaticScatterLabelling',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath: '/dist/'
  },
  externals: {
    lodash: '_'
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
          plugins: ['meaningful-logs']
        }
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        worker: {
          output: {
            filename: 'automatic-label-worker.js',
            chunkFilename: '[id].worker.js'
          },
          externals: {
            lodash: '_'
          }
        }
      }
    })
  ]
  //watch: true
}