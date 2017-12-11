const os = require('os');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = config => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'test.js', watched: false }
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '*.js': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5,

    webpack: {
      module: {
        loaders: [
          {
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          },
          {
            test: /\.html?$/,
            loader: 'raw-loader'
          }
        ],
      },
      devtool: 'source-map',
      watch: false,
    },

    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: [ '-headless' ],
      },
    },

    browserDisconnectTimeout: 10000,
    browsers: [
      {
        name: 'ChromeHeadless',
        test() {
          return process.env.HEADLESS !== 'false';
        }
      },
      {
        name: 'Chrome',
        test() {
          return process.env.HEADLESS === 'false';
        }
      },
      {
        name: 'FirefoxHeadless',
        test() {
          return process.env.HEADLESS !== 'false';
        }
      },
      {
        name: 'Firefox',
        test() {
          return process.env.HEADLESS === 'false';
        }
      },
      {
        name: 'Safari',
        test() {
          return os.platform() === 'darwin' && process.env.HEADLESS === 'false'
        }
      },
      {
        name: 'IE',
        test() {
          return os.platform() === 'win32' && process.env.HEADLESS === 'false'
        }
      }
    ]
    .filter(browser => browser.test())
    .map(browser => browser.name)
  })
}
