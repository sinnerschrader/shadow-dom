/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('interrupts the cascade', () => {
  const {scope, cleanup} = bootstrap('basic-scope');

  const b = scope.shadowRoot.querySelector('.b');
  const color = window.getComputedStyle(b).getPropertyValue('color');
  expect(color).toBe('rgb(0, 0, 0)');

  cleanup();
});

it('enforces basic cascade scoping for pseudo elements', () => {
  const {scope, cleanup} = bootstrap('basic-scope-pseudo-elements');

  const a = scope.shadowRoot.querySelector('.a');
  const before = window.getComputedStyle(a, ':before').getPropertyValue('height');
  const after = window.getComputedStyle(a, ':after').getPropertyValue('height');

  expect(['0px', 'auto']).toContain(before);
  expect(['0px', 'auto']).toContain(after);

  cleanup();
});

it('enforces basic cascade scoping for pseudo classes', () => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    return;
  }

  const id = 'basic-scope-pseudo-classes';
  const {scope, cleanup} = bootstrap(id);

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

  cleanup();
});

it('cascade scoping respects default styling of html elements', () => {
  const {scope, cleanup} = bootstrap('basic-default-styles');

  const a = scope.shadowRoot.querySelector('a');
  const b = scope.shadowRoot.querySelector('b');
  const address = scope.shadowRoot.querySelector('address');
  const mark = scope.shadowRoot.querySelector('mark');

  const aDecoration = window.getComputedStyle(a).getPropertyValue('text-decoration');
  const bWeight = window.getComputedStyle(b).getPropertyValue('font-weight');
  const addressFontStyle = window.getComputedStyle(address).getPropertyValue('font-style');
  const markBackground = window.getComputedStyle(mark).getPropertyValue('background-color');

  expect(['underline', 'underline solid rgb(0, 0, 238)']).toContain(aDecoration);
  expect(['700', 'bold']).toContain(bWeight);
  expect(addressFontStyle).toBe('italic');
  expect(markBackground).toBe('rgb(255, 255, 0)');

  cleanup();
});

it('cascade scoping respects styling of inner scope', () => {
  const {scope, cleanup} = bootstrap('inner-scope');

  const b = scope.shadowRoot.querySelector('.b');
  const color = window.getComputedStyle(b).getPropertyValue('color');
  expect(color).toBe('rgb(0, 128, 0)');

  cleanup();
});

it('cascade scoping respects styling of inner scope pseudo elements', () => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    return;
  }

  const {scope, cleanup} = bootstrap('inner-scope-pseudo-elements');

  const b = scope.shadowRoot.querySelector('.b');
  const beforeColor = window.getComputedStyle(b, ':before').getPropertyValue('color');
  expect(beforeColor).toBe('rgb(0, 128, 0)');

  cleanup();
});
