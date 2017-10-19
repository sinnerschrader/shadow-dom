sauceLabsDesktopBrowsers = require('./sauce-labs-desktop-browsers');
sauceLabsDeviceBrowsers = require('./sauce-labs-device-browsers');

const baseProperty = 'SauceLabs';

/**
 * Returns Sauce Labs custom launcher objects for use in Karma tests
 *
 * @returns {Array} - an array of custom launcher objects
 */
module.exports = function getSauceLabsCustomLaunchers() {
  customLaunchers = {};

  sauceLabsDesktopBrowsers.forEach((browser) => {
    const browserName = browser.name;

    Object.keys(browser.versions).forEach((browserVersion) => {
      const platforms = browser.versions[browserVersion] || [];
      platforms.forEach((platform) => {
        const launcherName = `SC_${browserName}_${browserVersion}_${platform.replace(/\s/ig, '')}_Launcher`;

        customLaunchers[launcherName] = {
          base: baseProperty,
          browserName: browserName,
          version: browserVersion,
          platform: platform,
          recordVideo: true,
          recordScreenshots: true,
          screenResolution: '1024x768'
        };
        });
    });
  });

  sauceLabsDeviceBrowsers.forEach((browser) => {
    const launcherName = `SC_${browser.platformName}_${browser.platformVersion}_${browser.deviceName}_${browser.browserName}_Launcher`;

    browser.base = baseProperty;
    browser.recordVideo = true;
    browser.recordScreenshots = true;
    browser.screenResolution = '1024x768';
    customLaunchers[launcherName] = browser;
  });

  return customLaunchers;
}
