/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

beforeEach(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

it('prevents bleeding', () => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    return;
  }

  const {ctx, scope, cleanup} = bootstrap('bleeding-scope');

  const outer = ctx.querySelector('.b');
  const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

  const inner = scope.shadowRoot.querySelector('.b');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

  expect(outerColor).toBe('rgb(0, 128, 0)');
  expect(innerColor).toBe('rgb(255, 0, 0)');

  cleanup();
});

it('prevents bleeding via basic media queries', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope-mq-basic');

  const inner = scope.shadowRoot.querySelector('.b');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(255, 0, 0)');

  cleanup();
});

it('prevents bleeding via complex media queries', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope-mq-complex');

  const inner = scope.shadowRoot.querySelector('.b');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(255, 0, 0)');

  cleanup();
});

it('prevents bleeding via supports queries', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope-supports-basic');

  const inner = scope.shadowRoot.querySelector('.b');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  const expected = (window.CSS && ('supports' in CSS)) ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)';

  expect(innerColor).toBe(expected);

  cleanup();
});

it('prevents bleeding after inner style mutations', () => {
  const {ctx, scope, cleanup} = bootstrap('bleeding-scope', {name: 'scope-style-mutationas'});

  const outer = ctx.querySelector('.b');
  const inner = scope.shadowRoot.querySelector('.b');

  const prev = scope.shadowRoot.querySelector('style');
  prev.textContent += `.b { background-color: yellow; }`;

  setTimeout(() => {
    const innerBg = window.getComputedStyle(inner).getPropertyValue('background-color');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

    const outerBg = window.getComputedStyle(outer).getPropertyValue('background-color');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

    expect(outerBg).toContain('rgb(128, 128, 128)');
    expect(outerColor).toBe('rgb(0, 128, 0)');

    expect(innerBg).toBe('rgb(255, 255, 0)');
    expect(innerColor).toBe('rgb(255, 0, 0)');
    cleanup();
  });
});

it('prevents bleeding after inner style additions', () => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    return;
  }

  const {ctx, scope, cleanup} = bootstrap('bleeding-scope', {name: 'scope-style-additions'});

  const outer = ctx.querySelector('.b');
  const inner = scope.shadowRoot.querySelector('.b');

  const style = document.createElement('style');
  style.textContent = `.b { background-color: yellow; }`;

  inner.appendChild(style);

  setTimeout(() => {
    const innerBg = window.getComputedStyle(inner).getPropertyValue('background-color');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

    const outerBg = window.getComputedStyle(outer).getPropertyValue('background-color');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

    expect(outerBg).toContain('rgb(128, 128, 128)');
    expect(outerColor).toBe('rgb(0, 128, 0)');

    expect(innerBg).toBe('rgb(255, 255, 0)');
    expect(innerColor).toBe('rgb(255, 0, 0)');
    cleanup();
  });
});
