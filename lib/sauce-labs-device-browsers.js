/**
 * Pre configured device browsers for testing on Sauce Labs
 */
const sauceLabsDeviceBrowsers = [
    {
        browserName: 'Safari',
        appiumVersion: '1.7.1',
        deviceName: 'iPhone Simulator',
        platformName: 'iOS',
        platformVersion: '10.3',
        deviceOrientation: 'portrait'
    },
    {
        browserName: 'Safari',
        appiumVersion: '1.7.1',
        deviceName: 'iPhone Simulator',
        platformName: 'iOS',
        platformVersion: '11.0',
        deviceOrientation: 'portrait'
    },
    {
        browserName: 'Chrome',
        appiumVersion: '1.6.4',
        deviceName: 'Android GoogleAPI Emulator',
        platformName: 'Android',
        platformVersion: '6.0',
        deviceOrientation: 'portrait'
    },
    {
        browserName: 'Chrome',
        appiumVersion: '1.6.4',
        deviceName: 'Android GoogleAPI Emulator',
        platformName: 'Android',
        platformVersion: '7.1',
        deviceOrientation: 'portrait'
    }
];

module.exports = sauceLabsDeviceBrowsers;
