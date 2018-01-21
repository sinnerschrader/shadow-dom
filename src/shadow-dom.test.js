/* global it, expect, viewport */
import {shadowDom} from './shadow-dom';
import {bootstrap, getFontList, getKeyFrames, setup} from './utils.test.js';

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

it('interrupts the cascade', () => {
  const {scope, cleanup} = bootstrap('basic-scope');

  if (!HAS_SHADOWDOM) {
    const b = scope.shadowRoot.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('enforces basic scoping for pseudo elements', () => {
  const {scope, cleanup} = bootstrap('basic-scope-pseudo-elements');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const before = window.getComputedStyle(a, ':before').getPropertyValue('height');
    const after = window.getComputedStyle(a, ':after').getPropertyValue('height');

    expect(['0px', 'auto']).toContain(before); // signals being not visible
    expect(['0px', 'auto']).toContain(after); // signals being not visible
  }

  cleanup();
});

it('enforces basic scoping for pseudo classes', () => {
  const id = 'basic-scope-pseudo-classes';
  const {scope, cleanup} = bootstrap(id);

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector(`[data-test-name="${id}"] input`);
    const inner = scope.shadowRoot.querySelector('input');

    const outerLabel = outer.nextElementSibling;
    const innerLabel = inner.nextElementSibling;

    {
      const outerColor = window.getComputedStyle(outerLabel).getPropertyValue('color');
      const innerColor = window.getComputedStyle(innerLabel).getPropertyValue('color');
      expect(outerColor).toBe('rgb(255, 165, 0)');
      expect(innerColor).toBe('rgb(0, 0, 255)');
    }

    {
      outer.setAttribute('checked', true);
      inner.setAttribute('checked', true);
      const outerColor = window.getComputedStyle(outerLabel).getPropertyValue('color');
      const innerColor = window.getComputedStyle(innerLabel).getPropertyValue('color');
      expect(outerColor).toBe('rgb(255, 0, 0)');
      expect(innerColor).toBe('rgb(0, 128, 0)');
    }
  }

  cleanup();
});

it('respects default styling of html elements', () => {
  const {scope, cleanup} = bootstrap('basic-default-styles');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('a');
    const b = scope.shadowRoot.querySelector('b');
    const address = scope.shadowRoot.querySelector('address');
    const mark = scope.shadowRoot.querySelector('mark');

    const aDecoration = window.getComputedStyle(a).getPropertyValue('text-decoration');
    const bWeight = window.getComputedStyle(b).getPropertyValue('font-weight');
    const addressFontStyle = window.getComputedStyle(address).getPropertyValue('font-style');
    const markBackground = window.getComputedStyle(mark).getPropertyValue('background-color');

    expect(aDecoration).toBe('underline');
    expect(bWeight).toBe('700');
    expect(addressFontStyle).toBe('italic');
    expect(markBackground).toBe('rgb(255, 255, 0)');
  }

  cleanup();
});

it('respects styling of inner scope', () => {
  const {scope, cleanup} = bootstrap('inner-scope');

  if (!HAS_SHADOWDOM) {
    const b = scope.shadowRoot.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('respects styling of inner scope pseudo elements', () => {
  const {scope, cleanup} = bootstrap('inner-scope-pseudo-elements');

  if (!HAS_SHADOWDOM) {
    const b = scope.shadowRoot.querySelector('.b');
    const beforeColor = window.getComputedStyle(b, ':before').getPropertyValue('color');
    expect(beforeColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('scopes against high specificity styling', () => {
  const {scope, cleanup} = bootstrap('high-specificity-scope');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('prevents bleeding', () => {
  const {cleanup} = bootstrap('bleeding-scope');

  if (!HAS_SHADOWDOM) {
    const b = document.querySelector('[data-test-name="bleeding-scope"] .b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('prevents bleeding via basic media queries', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope-mq-basic');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(255, 0, 0)');
  }

  cleanup();
});

it('prevents bleeding via complex media queries', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope-mq-complex');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(255, 0, 0)');
  }

  cleanup();
});

it('prevents bleeding via supports queries', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope-supports-basic');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    const expected = (window.CSS && ('supports' in CSS)) ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)';

    expect(innerColor).toBe(expected);
  }

  cleanup();
});

it('resets !important rules', () => {
  const {scope, cleanup} = bootstrap('important-outer');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('resets !important rules in pseudo elements', () => {
  const {scope, cleanup} = bootstrap('important-outer-pseudo-elements');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('resets !important rules in pseudo classes', () => {
  const {scope, cleanup} = bootstrap('important-outer-pseudo-classes');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('input');
    const innerLabel = inner.nextElementSibling;

    {
      const innerColor = window.getComputedStyle(innerLabel).getPropertyValue('color');
      expect(innerColor).toBe('rgb(0, 0, 0)');
    }

    {
      inner.setAttribute('checked', true);
      const innerColor = window.getComputedStyle(innerLabel).getPropertyValue('color');
      expect(innerColor).toBe('rgb(0, 0, 0)');
    }
  }

  cleanup();
});

it('uses scoped style for !important props', () => {
  const {scope, cleanup} = bootstrap('important-inner');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('preserves specifity relations as found', () => {
  const {scope, cleanup} = bootstrap('important-inner-tree');

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
  const {scope, cleanup} = bootstrap('important-high-specificity');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('protects from !important rules with escalating specificity', () => {
  const {scope, cleanup} = bootstrap('important-id-specificity');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 0, 0)');
  }

  cleanup();
});

it('protects from !important pseudo element rules with escalating specificity', () => {
  const {scope, cleanup} = bootstrap('important-id-specificity-pseudo');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const aColor = window.getComputedStyle(a, '::before').getPropertyValue('color');
    expect(aColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('protects from !important pseudo classes with escalating specificity', () => {
  const {scope, cleanup} = bootstrap('important-id-specificity-pseudo-classes');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('input');
    {
      const aBorder = window.getComputedStyle(a).getPropertyValue('outline-color');
      expect(aBorder).toBe('rgb(0, 128, 0)');
    }
    {
      a.setAttribute('checked', true);
      const aBorder = window.getComputedStyle(a).getPropertyValue('outline-color');
      expect(aBorder).toBe('rgb(0, 128, 0)');
    }
  }

  cleanup();
});

it('protects from !important rules in media queries <= 500px', () => {
  viewport.set(499);
  const {scope, cleanup} = bootstrap('important-outer-mq');

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
  const {scope, cleanup} = bootstrap('important-outer-mq');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 255)');
  }

  cleanup();
  viewport.reset();
});

/* it('protects animations from name collisions', () => {
  const {scope, cleanup} = bootstrap('globals-animation');

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
  const {scope, cleanup} = bootstrap('globals-fontface');

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector('.a');
    const inner = scope.shadowRoot.querySelector('.b');

    const outerFontList = getFontList(outer);
    const innerFontList = getFontList(inner);

    expect(outerFontList).toContain('a');
    expect(innerFontList).not.toContain('a');
  }

  cleanup();
}); */

it('handles invalid css selectors gracefully', () => {
  const {cleanup} = bootstrap('invalid-selectors'); // does not throw
  cleanup();
});

it('encapsulates against selectors matching mount point', () => {
  const {scope, cleanup} = bootstrap('mount-selector');

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector('[data-test-name="mount-selector"] .a');
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('protects default-hidden elements against revealing styles', () => {
  const {scope, cleanup} = bootstrap('hidden-elements');

  if (!HAS_SHADOWDOM) {
    const inner = Array.prototype.slice.call(document.querySelectorAll('[data-testname="hidden-elements"] .shadow-dom style, [data-testname="hidden-elements"] .shadow-dom script'), 0);
    const visible = inner.filter(i => i.offsetParent !== null);
    expect(visible.length).toBe(0);
  }

  cleanup();
});

