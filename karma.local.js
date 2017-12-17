const os = require('os');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'viewport'],
    files: [
      {pattern: 'src/**/*.test.js', watched: false},
      {pattern: './fixtures/*', included: false, served: true}
    ],
    preprocessors: {
      'src/**/*.js': ['webpack']
    },
    reporters: ['dots'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    concurrency: 5,
    webpack: {
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
      devtool: 'source-map',
      watch: false
    },
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
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
          return os.platform() === 'darwin' && process.env.HEADLESS === 'false';
        }
      },
      {
        name: 'IE',
        test() {
          return os.platform() === 'win32' && process.env.HEADLESS === 'false';
        }
      }
    ]
    .filter(browser => browser.test())
    .map(browser => browser.name)
  });
};
