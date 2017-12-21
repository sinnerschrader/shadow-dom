
> A shadow dom ponyfill 
>
> **🚧 Please note**: This is a work in progress and not usable for production yet

# shadow-dom ![stability][stability-svg]

> [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=VmZaUGhsRktHNDVmZEdvdmw4SUZXRStUT09BYko5OS80Mml3MGJsV3laWT0tLXpDTkNMS2xBbFltUDRYU3YzdG1SUkE9PQ%3D%3D--2a2e702619b83d217e722e79510189a7e589f02c)](https://www.browserstack.com/automate/public-build/TnZTcXBIZGhUMEpNcHFXYVZXWWZLN2tNR0s5cWhyU3Q1Y2hLTERWMXBsYz0tLUdEaUY0bHZtdjRGSDhGQXl2eDJzbmc9PQ==--7ab74ceef968a388bdb60f9d3ca6431b3f819b83>)

* 🌲 planed obsolescence: uses native `shadow-dom` if available
* 📦 encapsulation: protect against css bleeding
* 👩‍💻 supports responsive design  

## Development

```
npx yarn
code src.js 
npx yarn test
```

## Testing

`shadow-dom` ensures functionality via cross browser testing

* `npm test`: Headless Chrome, Headless Firefox
* `BROWSER_STACK_USERNAME=<username> BROWSER_STACK_ACCESS_KEY=<password> npm test`

Testing may optionally be limited to browsers via cli flags

* `npm test -- --firefox` Test only in Firefox
* `npm test -- --chrome` Test only in Chrome

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
