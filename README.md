
> A shadow dom ponyfill 
>
> **🚧 Please note**: This is a work in progress and not usable for production yet

# shadow-dom ![stability][stability-svg]

> [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=VmZaUGhsRktHNDVmZEdvdmw4SUZXRStUT09BYko5OS80Mml3MGJsV3laWT0tLXpDTkNMS2xBbFltUDRYU3YzdG1SUkE9PQ%3D%3D--2a2e702619b83d217e722e79510189a7e589f02c)](https://www.browserstack.com/automate/public-build/TnZTcXBIZGhUMEpNcHFXYVZXWWZLN2tNR0s5cWhyU3Q1Y2hLTERWMXBsYz0tLUdEaUY0bHZtdjRGSDhGQXl2eDJzbmc9PQ==--7ab74ceef968a388bdb60f9d3ca6431b3f819b83>)

* 🌲 planed obsolescence: uses native `shadow-dom` if available
* 📦 encapsulation: protect against css bleeding
* 👩‍💻 supports responsive design  

## Installation

```
npm install --save shadow-dom
```

## Usage

```js
const {shadowDom} = require('shadow-dom');

const el = document.querySelector('[data-protected]');
const protected = shadowDom(el);

protected.shadowRoot.innerHTML = '<p>This is protected against outer styles</p>';
```

## Development

```
npx yarn
code src.js 
npx yarn test
```

## Testing

`shadow-dom` ensures functionality via cross browser testing

* `yarm test --local`: Headless Chrome, Headless Firefox
* `yarn test --remote`: Test on BrowserStack

Remote tests require BrowserStack credentials. Provide them by CLI or a `.env` file:

```ini
BROWSER_STACK_USERNAME=[browserstack-username]
BROWSER_STACK_ACCESS_KEY=[browserstack-access-key]
```

Testing may optionally be limited to browsers via cli flags

* `yarn test -- --firefox` Test only in Firefox
* `yarn test -- --chrome` Test only in Chrome

```sh
# All flags
--chrome
--edge
--firefox
--ie
--safari
```

## License

`shadow-dom` is published under the MIT license

[stability-svg]: https://img.shields.io/badge/stability-unreleased-red.svg?style=flat-square
