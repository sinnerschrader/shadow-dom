import ShadowDOM from './src';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('should exist', () => {
    expect(ShadowDOM).toBeDefined();
});

it('has a shadowRoot property', () => {
  const {shadowDOM, cleanup} = setup();
  expect(shadowDOM.shadowRoot).toBeDefined();
  cleanup();
});

it('is native if supported and polyfilled if not', () => {
  const {shadowDOM, cleanup} = setup();
  const expected = HAS_SHADOWDOM ? '[object ShadowRoot]' : '[object HTMLBodyElement]';
  expect(shadowDOM.shadowRoot.toString()).toBe(expected);
  cleanup();
});

function setup() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return {
    el,
    cleanup() {
      document.body.removeChild(el);
    },
    shadowDOM: new ShadowDOM(el)
  };
}
