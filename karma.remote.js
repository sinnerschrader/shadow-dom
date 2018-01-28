const env = require('dotenv');
const meow = require('meow');

const cli = meow();

env.config();

const DEFAULT_BROWSERS = [
  'bs_chrome',
  'bs_firefox',
  'bs_safari',
  'bs_ie',
  'bs_edge'
];

module.exports = config => {
  if (!process.env.BROWSER_STACK_USERNAME || !process.env.BROWSER_STACK_ACCESS_KEY) {
    console.log(`BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY must be set for test --remote`);
    process.exit(1);
  }

  const indicated = [
    cli.flags.ie && 'bs_ie',
    cli.flags.edge && 'bs_edge',
    cli.flags.safari && 'bs_safari',
    cli.flags.chrome && 'bs_chrome'
  ].filter(Boolean);

  const browsers = indicated.length === 0 ? DEFAULT_BROWSERS : indicated;

  config.set({
    basePath: '',
    frameworks: ['jasmine', 'viewport'],
    files: [
      {pattern: 'src/**/*.test.js', watched: false},
      {pattern: 'test/**/*.js', watched: false}
    ],
    exclude: [
    ],
    preprocessors: {
      'src/**/*.js': ['webpack'],
      'test/**/*.js': ['webpack']
    },
    reporters: ['dots', 'BrowserStack'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true,
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
    browserStack: {
      username: process.env.BROWSER_STACK_USERNAME,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY
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
    browsers
  });
};
