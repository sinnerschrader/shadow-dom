/* global it, expect, viewport */
import {bootstrap} from '../src/utils.test';

it('resets !important rules', () => {
  const {scope, cleanup} = bootstrap('important-outer');

  const inner = scope.shadowRoot.querySelector('p');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(0, 0, 0)');

  cleanup();
});

it('resets !important rules in pseudo elements', () => {
  const {scope, cleanup} = bootstrap('important-outer-pseudo-elements');

  const inner = scope.shadowRoot.querySelector('p');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(0, 0, 0)');

  cleanup();
});

it('resets !important rules in pseudo classes', () => {
  const {scope, cleanup} = bootstrap('important-outer-pseudo-classes');

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

  cleanup();
});

it('uses scoped style for !important props', () => {
  const {scope, cleanup} = bootstrap('important-inner');

  const inner = scope.shadowRoot.querySelector('p');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(0, 128, 0)');

  cleanup();
});

it('preserves specifity relations as found', () => {
  const {scope, cleanup} = bootstrap('important-inner-tree');

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

  cleanup();
});

it('protects from !important rules with higher specificity', () => {
  const {scope, cleanup} = bootstrap('important-high-specificity');

  const a = scope.shadowRoot.querySelector('.a');
  const color = window.getComputedStyle(a).getPropertyValue('color');
  expect(color).toBe('rgb(0, 128, 0)');

  cleanup();
});

it('protects from !important rules with escalating specificity', () => {
  const {scope, cleanup} = bootstrap('important-id-specificity');

  const a = scope.shadowRoot.querySelector('.a');
  const color = window.getComputedStyle(a).getPropertyValue('color');
  expect(color).toBe('rgb(0, 0, 0)');

  cleanup();
});

it('protects from !important pseudo element rules with escalating specificity', () => {
  const {scope, cleanup} = bootstrap('important-id-specificity-pseudo');

  const a = scope.shadowRoot.querySelector('.a');
  const aColor = window.getComputedStyle(a, '::before').getPropertyValue('color');
  expect(aColor).toBe('rgb(0, 128, 0)');

  cleanup();
});

it('protects from !important pseudo classes with escalating specificity', () => {
  const {scope, cleanup} = bootstrap('important-id-specificity-pseudo-classes');

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

  cleanup();
});

it('protects from !important rules in media queries <= 500px', () => {
  viewport.set(499);
  const {scope, cleanup} = bootstrap('important-outer-mq');

  const inner = scope.shadowRoot.querySelector('.b');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(0, 128, 0)');

  cleanup();
  viewport.reset();
});

it('protects from !important rules in media queries > 500px', () => {
  viewport.set(501);
  const {scope, cleanup} = bootstrap('important-outer-mq');

  const inner = scope.shadowRoot.querySelector('.b');
  const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
  expect(innerColor).toBe('rgb(0, 0, 255)');

  cleanup();
  viewport.reset();
});
