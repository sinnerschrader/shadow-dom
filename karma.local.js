const os = require('os');
const meow = require('meow');
const cli = meow();

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = config => {
  const indicated = 'chrome' in cli.flags ||
    'safari' in cli.flags ||
    'firefox' in cli.flags ||
    'ie' in cli.flags;

  const pattern = 'pattern' in cli.flags ? `src/**/${cli.flags.pattern}` : 'src/**/*.test.js';

  config.set({
    basePath: '',
    frameworks: ['jasmine', 'viewport'],
    files: [
      {pattern, watched: false},
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
          return process.env.HEADLESS !== 'false' && (!indicated || cli.flags.chrome);
        }
      },
      {
        name: 'Chrome',
        test() {
          return process.env.HEADLESS === 'false' && (!indicated || cli.flags.chrome);
        }
      },
      {
        name: 'FirefoxHeadless',
        test() {
          return process.env.HEADLESS !== 'false' && (!indicated || cli.flags.firefox);
        }
      },
      {
        name: 'Firefox',
        test() {
          return process.env.HEADLESS === 'false' && (!indicated || cli.flags.firefox);
        }
      },
      {
        name: 'Safari',
        test() {
          return os.platform() === 'darwin' && process.env.HEADLESS === 'false' && (!indicated || cli.flags.safari);
        }
      },
      {
        name: 'IE',
        test() {
          return os.platform() === 'win32' && process.env.HEADLESS === 'false' && (!indicated || cli.flags.ie);
        }
      }
    ]
    .filter(browser => browser.test())
    .map(browser => browser.name)
  });
};
