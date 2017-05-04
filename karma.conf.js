module.exports = function (config) {
  config.set({
    // ... normal karma configuration
    files: [
      {pattern: 'test/*-test.js', watched: false}
    ],
    frameworks: ['browserify', 'mocha', 'chai'],
    browserNoActivityTimeout: 100000,
    preprocessors: {
      'test/*-test.js': ['browserify']
    },
    reporters: ['progress', 'coverage'],
    customLaunchers: {
      ChromeOutOfFocus: {
        base: 'Chrome',
        flags: ['--window-size=300,300', ' --remote-debugging-port=9222']
      }
    },
    browserify: {
      debug: true,
      transform: [['babelify', {plugins: ['meaningful-logs', 'istanbul']}]]
    },
    browsers: ['ChromeOutOfFocus'],
    browserConsoleLogOptions: {
      terminal: true,
      level: ''
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    }
  })
}
