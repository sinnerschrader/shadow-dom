module.exports = config => {
  if (!process.env.BROWSER_STACK_USERNAME || !process.env.BROWSER_STACK_ACCESS_KEY) {
    console.log('Falling back to local tests as BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY are not set.');
    require('./karma.local.js'); // eslint-disable-line import/no-unassigned-import
    process.exit(0); // eslint-disable-line unicorn/no-process-exit
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', 'viewport'],
    files: [
      {pattern: 'test.js', watched: false},
      {pattern: './fixtures/*', included: false, served: true}
    ],
    exclude: [
    ],
    preprocessors: {
      '*.js': ['webpack']
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
    customLaunchers: {
      bs_chrome: { // eslint-disable-line camelcase
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: '62.0', // eslint-disable-line camelcase
        os: 'OS X',
        os_version: 'Sierra' // eslint-disable-line camelcase
      },
      bs_firefox: { // eslint-disable-line camelcase
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '57.0', // eslint-disable-line camelcase
        os: 'OS X',
        os_version: 'Sierra' // eslint-disable-line camelcase
      },
      bs_safari: { // eslint-disable-line camelcase
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '11', // eslint-disable-line camelcase
        os: 'OS X',
        os_version: 'High Sierra' // eslint-disable-line camelcase
      },
      bs_ie: { // eslint-disable-line camelcase
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11.0', // eslint-disable-line camelcase
        os: 'Windows',
        os_version: '10' // eslint-disable-line camelcase
      },
      bs_edge: { // eslint-disable-line camelcase
        base: 'BrowserStack',
        browser: 'edge',
        browser_version: '16', // eslint-disable-line camelcase
        os: 'Windows',
        os_version: '10' // eslint-disable-line camelcase
      }
    },
    browsers: [
      'bs_chrome',
      'bs_firefox',
      'bs_safari',
      'bs_ie',
      'bs_edge'
    ]
  });
};
