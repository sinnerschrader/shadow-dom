import shadowDom from './src';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('should exist', () => {
    expect(shadowDom).toBeDefined();
});

it('has a shadowRoot property', () => {
  const {scope, cleanup} = setup();
  expect(scope.shadowRoot).toBeDefined();
  cleanup();
});

it('is native if supported', () => {
  const {scope, cleanup} = setup();
  if (HAS_SHADOWDOM) {
    expect(scope.shadowRoot.toString()).toBe('[object ShadowRoot]');
  }
  cleanup();
});

it('is plain element if unsupported', () => {
  const {scope, cleanup} = setup();
  if (!HAS_SHADOWDOM) {
    expect(scope.shadowRoot instanceof HTMLElement).toBeTruthy();
  }
  cleanup();
});

it('enforces basic scoping', () => {
  if (HAS_SHADOWDOM) {
    return;
  }

  const {scope, cleanup} = fixture('basic-scope');
  const b = scope.shadowRoot.querySelector('.b');
  const color = window.getComputedStyle(b).getPropertyValue('color');
  expect(color).toBe('rgb(0, 0, 0)');
  cleanup();
});

it('does not overrride styling of inner scope', () => {
  if (HAS_SHADOWDOM) {
    return;
  }
  const {scope, cleanup} = fixture('inner-scope');
  const b = scope.shadowRoot.querySelector('.b');
  const color = window.getComputedStyle(b).getPropertyValue('color');
  expect(color).toBe('rgb(0, 128, 0)');
  // cleanup();
});

function fixture(name) {
  const html = require(`./fixtures/${name}.html`);
  return setup(html);
}

function setup(html) {
  const el = document.createElement('div');

  if (html) {
    el.innerHTML = html;
  } else {
    const auto = document.createElement('div');
    auto.classList.add('shadow-dom');
    el.appendChild(auto);
  }

  document.body.appendChild(el);

  const shadowElement = el.querySelector('.shadow-dom');

  if (!shadowElement) {
    throw new Error(`setup failed, html provided but no .shadow-dom element found`);
  }

  const cleanup = () => document.body.removeChild(el);

  const innerHTML = shadowElement.innerHTML;
  const scope = shadowDom(shadowElement);
  scope.shadowRoot.innerHTML = innerHTML;

  return {
    cleanup,
    scope
  };
}
