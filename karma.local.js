const os = require('os');
const path = require('path');
const globby = require('globby');
const meow = require('meow');

const cli = meow();
const has = name => hasFlag(cli, name);

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = config => {
  const indicated = has('chrome') || has('safari') || has('firefox') || has('ie');
  const pattern = Array.isArray(cli.flags.pattern) ? cli.flags.pattern : [cli.flags.pattern];

  const ps = pattern.reduce((acc, p) => acc.concat([`src/**/${p}`, `test/**/${p}`]), []);

  const files = has('pattern')
    ? globby.sync(ps)
    : [
      {pattern: 'src/**/*.test.js', watched: false},
      {pattern: 'test/**/*.js', watched: false}
    ];

  if (has('pattern')) {
    console.log('Pattern:', ps.join(', '));
    console.log('Matched:', files.join(', '));
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', 'viewport'],
    files: files.concat([
      {pattern: './fixtures/*', included: false, served: true},
    ]),
    preprocessors: {
      'src/**/*.js': ['webpack'],
      'test/**/*.js': ['webpack']
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
            loader: 'babel-loader',
            include: [
              path.resolve(__dirname, 'src'),
              path.resolve(__dirname, 'test'),
              require.resolve('dot-prop'), // Transpile, targets node 4
              require.resolve('postcss-selector-parser') // Transpile, targets node 4
            ]
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

function hasFlag(cli, name) {
  return Object.prototype.hasOwnProperty.call(cli.flags, name);
}
