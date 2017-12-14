/* global it, expect, viewport */
import {shadowDom} from './src';

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

it('enforces basic scoping for pseudo elements', () => {
  const {scope, cleanup} = fixture('basic-scope-pseudo-elements');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const before = window.getComputedStyle(a, ':before').getPropertyValue('height');
    const after = window.getComputedStyle(a, ':after').getPropertyValue('height');

    expect(['0px', 'auto']).toContain(before); // signals being not visible
    expect(['0px', 'auto']).toContain(after); // signals being not visible
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

it('respects styling of inner scope pseudo elements', () => {
  const {scope, cleanup} = fixture('inner-scope-pseudo-elements');

  if (!HAS_SHADOWDOM) {
    const b = scope.shadowRoot.querySelector('.b');
    const beforeColor = window.getComputedStyle(b, ':before').getPropertyValue('color');
    expect(beforeColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('scopes against high specificity styling', () => {
  const {scope, cleanup} = fixture('high-specificity-scope');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('prevents bleeding', () => {
  const {cleanup} = fixture('bleeding-scope');

  if (!HAS_SHADOWDOM) {
    const b = document.querySelector('[data-test-name="bleeding-scope"] .b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('prevents bleeding via basic media queries', () => {
  const {scope, cleanup} = fixture('bleeding-scope-mq-basic');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(255, 0, 0)');
  }

  cleanup();
});

it('prevents bleeding via complex media queries', () => {
  const {scope, cleanup} = fixture('bleeding-scope-mq-complex');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(255, 0, 0)');
  }

  cleanup();
});

it('prevents bleeding via supports queries', () => {
  const {scope, cleanup} = fixture('bleeding-scope-supports-basic');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    const expected = (window.CSS && ('supports' in CSS)) ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)';

    expect(innerColor).toBe(expected);
  }

  cleanup();
});

it('resets !important rules', () => {
  const {scope, cleanup} = fixture('important-outer');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('uses scoped style for !important props', () => {
  const {scope, cleanup} = fixture('important-inner');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
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
    expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(aBack);
    expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(bBack);
  }

  cleanup();
});

it('protects from !important rules with higher specificity', () => {
  const {scope, cleanup} = fixture('important-high-specificity');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('protects from !important rules with escalating specificity', () => {
  const {scope, cleanup} = fixture('important-id-specificity');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('protects from !important rules in media queries <= 500px', () => {
  viewport.set(499);
  const {scope, cleanup} = fixture('important-outer-mq');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
  viewport.reset();
});

it('protects from !important rules in media queries > 500px', () => {
  viewport.set(501);
  const {scope, cleanup} = fixture('important-outer-mq');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 255)');
  }

  cleanup();
  viewport.reset();
});

it('protects animations from name collisions', () => {
  const {scope, cleanup} = fixture('globals-animation');

  if (!HAS_SHADOWDOM) {
    const ctx = document.querySelector('[data-test-name="globals-animation"]');
    const outer = document.querySelector('[data-test-name="globals-animation"] .a');
    const inner = scope.shadowRoot.querySelector('.b');

    const outerAnimationName = window.getComputedStyle(outer).getPropertyValue('animation-name');
    const innerAnimationName = window.getComputedStyle(inner).getPropertyValue('animation-name');

    const [outerAnimation] = getKeyFrames(outerAnimationName, ctx);
    const [innerAnimation] = getKeyFrames(innerAnimationName, ctx);

    expect(outerAnimationName).toBe('a');
    expect(innerAnimationName).not.toBe('a');
    expect(outerAnimation.style.getPropertyValue('color')).toBe('red');
    expect(innerAnimation.style.getPropertyValue('color')).toBe('green');
  }

  cleanup();
});

it('protects fonts from name collisions', () => {
  const {scope, cleanup} = fixture('globals-fontface');

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector('.a');
    const inner = scope.shadowRoot.querySelector('.b');

    const outerFontList = getFontList(outer);
    const innerFontList = getFontList(inner);

    expect(outerFontList).toContain('a');
    expect(innerFontList).not.toContain('a');
  }

  cleanup();
});

it('handles invalid css selectors gracefully', () => {
  const {cleanup} = fixture('invalid-selectors'); // does not throw
  cleanup();
});

it('encapsulates against selectors matching mount point', () => {
  const {scope, cleanup} = fixture('mount-selector');

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector('[data-test-name="mount-selector"] .a');
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('protects default-hidden elements against revealing styles', () => {
  const {scope, cleanup} = fixture('hidden-elements');

  if (!HAS_SHADOWDOM) {
    const inner = Array.prototype.slice.call(document.querySelectorAll('[data-testname="hidden-elements"] .shadow-dom style, [data-testname="hidden-elements"] .shadow-dom script'), 0);
    const visible = inner.filter(i => i.offsetParent !== null);
    expect(visible.length).toBe(0);
  }

  cleanup();
});

function fixture(name) {
  const html = require(`./fixtures/${name}.html`);
  return setup(html, {name});
}

function getAnimation(animationName, ctx) {
  const styles = Array.prototype.slice.call(ctx.querySelectorAll('style'), 0);
  const animations = styles
    .reduce((acc, s) => {
      Array.prototype.push.apply(acc, s.sheet.cssRules);
      return acc;
    }, [])
    .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);

  const matches = animations.filter(animation => animation.name === animationName);
  return matches[matches.length - 1];
}

function getFontList(element) {
  const fontFamily = window.getComputedStyle(element).getPropertyValue('font-family');
  return fontFamily.split(',').map(f => f.trim());
}

function getKeyFrames(animationName, ctx) {
  const animation = getAnimation(animationName, ctx);

  if (!animation) {
    return [];
  }

  return Array.prototype.slice.call(animation.cssRules, 0);
}

function setup(html, options) {
  const el = document.createElement('div');
  if (options && options.name) {
    el.setAttribute('data-test-name', options.name);
  }

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

  const cleanup = () => {
    document.body.removeChild(el);
  }

  const innerHTML = shadowElement.innerHTML;
  const scope = shadowDom(shadowElement);
  scope.shadowRoot.innerHTML = innerHTML;

  return {
    cleanup,
    scope
  };
}
