import ShadowDOM from './src';

const browserSupportsShadowDOM = ('attachShadow' in document.createElement('div'));
const regularDOM = document.createElement('div');
const shadowDOMContainer = document.createElement('div');
const bodyElement = document.querySelector('body');

bodyElement.appendChild(regularDOM);
bodyElement.appendChild(shadowDOMContainer);

regularDOM.innerHTML = `
    <style>
        h3 {
            color: #f00;
        }
    </style>
    <h3>Regular DOM</span>
`;

const shadowDOM = new ShadowDOM(shadowDOMContainer);

shadowDOM.innerHTML = `
    <style>
        h3 {
            color: #0f0;
        }
    </style>
    <h3>Shadow DOM</span>
`;

describe('Basic tests', function() {
    it('ShadowDOM ponyfill class should exist', function() {
        expect(ShadowDOM).toBeDefined();
    });

    it('ShadowDOM instance has a shadowRoot property', function() {
        expect(shadowDOM.shadowRoot).toBeDefined();
    });

    if (browserSupportsShadowDOM) {
        it('shadowRoot property is a ShadowRoot instance if browser supports native shadow DOM', function() {
            expect(shadowDOM.shadowRoot.toString()).toBe('[object ShadowRoot]');
        });
    } else {
        it('shadowRoot property is an body element instance if browser does not support native shadow DOM', function() {
            expect(shadowDOM.shadowRoot.toString()).toBe('[object HTMLBodyElement]');
        });
    }
});
