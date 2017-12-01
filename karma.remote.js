module.exports = config => {
  if (!process.env.BROWSER_STACK_USERNAME || !process.env.BROWSER_STACK_ACCESS_KEY) {
    console.log('Falling back to local tests as BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY are not set.');
    require('./karma.local.js');
    process.exit(0);
  }

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


    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '*.js': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'BrowserStack'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5,

    webpack: {
      module: {
        loaders: [
          {
            test: /\.(js?|es?)$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }
        ],
      },
      devtool: 'source-map',
      watch: false,
    },

    browserStack: {
      username: 'hello+browserstack@mario-nebl.de',
      accessKey: 'qEHVQQt3RmXyZQpBMYaz'
    },

    customLaunchers: {
      bs_chrome: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: '62.0',
        os: 'OS X',
        os_version: 'Sierra'
      },
      bs_firefox: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '57.0',
        os: 'OS X',
        os_version: 'Sierra'
      },
      bs_safari: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '11',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_ie: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_edge: {
        base: 'BrowserStack',
        browser: 'edge',
        browser_version: '16',
        os: 'Windows',
        os_version: '10'
      }
    },

    browsers: ['bs_chrome', 'bs_firefox', 'bs_safari', 'bs_ie', 'bs_edge'],

    // to avoid DISCONNECTED messages
    browserDisconnectTimeout : 10000, // default 2000
    browserDisconnectTolerance : 1, // default 0
    browserNoActivityTimeout : 4 * 60 * 1000, //default 10000
    captureTimeout : 4 * 60 * 1000 //default 60000
  })
}
