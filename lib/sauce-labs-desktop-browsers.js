const PLATFORM_WIN_7 = 'Windows 7';
const PLATFORM_WIN_8 = 'Windows 8';
const PLATFORM_WIN_8_1 = 'Windows 8.1';
const PLATFORM_WIN_10 = 'Windows 10';
const PLATFORM_MAC_MAVERICKS_10_9 = 'OS X 10.9';
const PLATFORM_MAC_YOSEMITE_10_10 = 'OS X 10.10';
const PLATFORM_MAC_ELCAPITAN_10_11 = 'OS X 10.11';
const PLATFORM_MAC_SIERRA_10_12 = 'macOS 10.12';
const PLATFORM_LINUX = 'Linux';

/**
 * Pre configured desktop browsers for testing on Sauce Labs
 */
const sauceLabsDesktopBrowsers = [
  {
    name: 'chrome',
    versions: {
      '59.0': [
        PLATFORM_WIN_7,
        PLATFORM_WIN_8,
        PLATFORM_WIN_8_1,
        PLATFORM_WIN_10,
        PLATFORM_MAC_SIERRA_10_12,
        PLATFORM_MAC_ELCAPITAN_10_11,
        PLATFORM_MAC_YOSEMITE_10_10,
        PLATFORM_MAC_MAVERICKS_10_9
      ],
      '60.0': [
        PLATFORM_WIN_7,
        PLATFORM_WIN_8,
        PLATFORM_WIN_8_1,
        PLATFORM_WIN_10,
        PLATFORM_MAC_SIERRA_10_12,
        PLATFORM_MAC_ELCAPITAN_10_11,
        PLATFORM_MAC_YOSEMITE_10_10,
        PLATFORM_MAC_MAVERICKS_10_9
      ],
      '61.0': [
        PLATFORM_WIN_7,
        PLATFORM_WIN_8,
        PLATFORM_WIN_8_1,
        PLATFORM_WIN_10,
        PLATFORM_MAC_SIERRA_10_12,
        PLATFORM_MAC_ELCAPITAN_10_11,
        PLATFORM_MAC_YOSEMITE_10_10,
        PLATFORM_MAC_MAVERICKS_10_9
      ],
      '48.0': [ // latest supported Chrome version on Linux on Sauce Labs
        PLATFORM_LINUX
      ]
    }
  },
  {
    name: 'firefox',
    versions: {
      '54.0': [
        PLATFORM_WIN_7,
        PLATFORM_WIN_8,
        PLATFORM_WIN_8_1,
        PLATFORM_WIN_10,
        PLATFORM_MAC_SIERRA_10_12,
        // PLATFORM_MAC_YOSEMITE_10_10, // not supported on Sauce Labs
        PLATFORM_MAC_ELCAPITAN_10_11,
        PLATFORM_MAC_MAVERICKS_10_9
      ],
      '47.0': [ // latest supported Firefox version on OSX 10.10 Yosemite on Sauce Labs
        PLATFORM_MAC_YOSEMITE_10_10
      ],
      '45.0': [ // latest supported Firefox version on Linux on Sauce Labs
        PLATFORM_LINUX
      ]
    }
  },
  {
    name: 'MicrosoftEdge',
    versions: {
      '13.10586': [
        PLATFORM_WIN_10,
      ],
      '14.14393': [
        PLATFORM_WIN_10,
      ],
      '15.15063': [
        PLATFORM_WIN_10,
      ]
    }
  },
  {
    name: 'internet explorer',
    versions: {
      '9.0': [
        PLATFORM_WIN_7,
        // PLATFORM_WIN_8   // not supported on Sauce Labs
        // PLATFORM_WIN_8_1 // not supported on Sauce Labs
        // PLATFORM_WIN_10  // not supported on Sauce Labs
      ],
      '10.0': [
        PLATFORM_WIN_7,
        PLATFORM_WIN_8
        // PLATFORM_WIN_8_1 // not supported on Sauce Labs
        // PLATFORM_WIN_10  // not supported on Sauce Labs
      ],
      '11.0': [
        PLATFORM_WIN_7,
        // PLATFORM_WIN_8,  // not supported on Sauce Labs
        PLATFORM_WIN_8_1
        // PLATFORM_WIN_10  // not supported on Sauce Labs
      ],
      '11.103': [
        // PLATFORM_WIN_7,   // not supported on Sauce Labs
        // PLATFORM_WIN_8,   // not supported on Sauce Labs
        // PLATFORM_WIN_8_1, // not supported on Sauce Labs
        PLATFORM_WIN_10
      ]
    }
  },
  {
    name: 'safari',
    versions: {
      '9.0': [
        PLATFORM_MAC_ELCAPITAN_10_11
      ],
      '10.0': [
        PLATFORM_MAC_SIERRA_10_12,
        PLATFORM_MAC_ELCAPITAN_10_11
      ],
      '10.1': [], // not supported on Sauce Labs
      '11.0': [] // not supported on Sauce Labs
    }
  }
];

module.exports = sauceLabsDesktopBrowsers;
