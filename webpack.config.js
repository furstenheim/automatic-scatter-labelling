var webpack = require('webpack')
var path = require('path')
module.exports = {
  entry: {
    app: ['./index.js']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'app-bundle.js'
  },
  //watch: true
}