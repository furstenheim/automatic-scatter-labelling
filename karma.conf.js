const path = require('path')
module.exports = function (config) {
  config.set({
    // ... normal karma configuration
    files: [
      {pattern: 'test/*-test.js', watched: false}
    ],
    frameworks: ['browserify', 'mocha', 'chai'],
    browserNoActivityTimeout: 10000,
    preprocessors: {
      'test/*-test.js': ['browserify']
    },
    customLaunchers: {
      ChromeOutOfFocus: {
        base: 'Chrome',
        flags: ['--headless', '--disable-gpu', '--window-size=300,300', ' --remote-debugging-port=9222']
      }
    },
    browserify: {
      debug: true,
      transform: [['babelify', {plugins: ['meaningful-logs']}]]
    },
    browsers: ['ChromeOutOfFocus'],
    browserConsoleLogOptions: {
      terminal: true,
      level: ''
    }
  })
}