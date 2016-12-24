const path = require('path')
module.exports = function (config) {
  config.set({
    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      {pattern: 'test/webgl/*-test.js', watched: false}
      // each file acts as entry point for the webpack configuration
    ],
    frameworks: ['mocha', 'chai'],
    browserNoActivityTimeout: 1000000000,
    preprocessors: {
      // add webpack as preprocessor
      'test/webgl/*-test.js': ['webpack']
    },
    customLaunchers: {
      ChromeOutOfFocus: {
        base: 'Chrome',
        flags: ['--window-size=300,300']
      }
    },

      webpack: {
        module: {
          loaders: [
            {
              test: /\.js$/,
              include: [path.join(__dirname, 'index'), path.join(__dirname, 'src')],
              loader: 'babel',
              query: {
                plugins: ['transform-async-to-generator', 'meaningful-logs']
              }
            }
          ]
        }
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },
    browsers: ['ChromeOutOfFocus']
  })
}