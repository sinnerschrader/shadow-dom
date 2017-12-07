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
    expect(scope.shadowRoot.toString()).toBe('[object HTMLDivElement]');
  }
  cleanup();
});

it('enforces basic scoping', () => {
  const {scope, cleanup} = fixture('basic-scope');

  if (!HAS_SHADOWDOM) {
    const b = scope.shadowRoot.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('respects styling of inner scope', () => {
  const {scope, cleanup} = fixture('inner-scope');

  if (!HAS_SHADOWDOM) {
    const b = scope.shadowRoot.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});


it('prevents bleeding', () => {
  const {scope, cleanup} = fixture('bleeding-scope');

  if (!HAS_SHADOWDOM) {
    const b = document.body.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('prevents bleeding via basic media queries', () => {
  const {scope, cleanup} = fixture('bleeding-scope-mq-basic');

  if (!HAS_SHADOWDOM) {
    const outer = document.body.querySelector('.b');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

    expect(outerColor).toBe('rgb(0, 128, 0)');
    expect(innerColor).toBe('rgb(255, 0, 0)');
  }

  cleanup();
});

it('prevents bleeding via complex media queries', () => {
  const {scope, cleanup} = fixture('bleeding-scope-mq-complex');

  if (!HAS_SHADOWDOM) {
    const outer = document.body.querySelector('.b');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(outerColor).toBe('rgb(0, 128, 0)');
    expect(innerColor).toBe('rgb(255, 0, 0)');
  }

  cleanup();
});

it('resets !important rules', () => {
  const {scope, cleanup} = fixture('important-outer');

  if (!HAS_SHADOWDOM) {
    const outer = document.body.querySelector('p');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(outerColor).toBe('rgb(255, 0, 0)');
    expect(innerColor).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('uses scoped style for !important props', () => {
  const {scope, cleanup} = fixture('important-inner');

  if (!HAS_SHADOWDOM) {
    const outer = document.body.querySelector('p');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(outerColor).toBe('rgb(255, 0, 0)');
    expect(innerColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('preserves specifity relations as found', () => {
  const {scope, cleanup} = fixture('important-inner-tree');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const b = scope.shadowRoot.querySelector('.b');
    const aColor = window.getComputedStyle(a).getPropertyValue('color');
    const aBack = window.getComputedStyle(a).getPropertyValue('background-color');
    const bColor = window.getComputedStyle(b).getPropertyValue('color');
    const bBack = window.getComputedStyle(b).getPropertyValue('background-color');

    expect(aColor).toBe('rgb(0, 128, 0)');
    expect(bColor).toBe('rgb(255, 0, 0)');
    expect(aBack).toBe('rgba(0, 0, 0, 0)');
    expect(bBack).toBe('rgba(0, 0, 0, 0)');
  }

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
