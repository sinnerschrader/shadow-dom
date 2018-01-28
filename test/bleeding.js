/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('prevents bleeding', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope');

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector('[data-test-name="bleeding-scope"] .b');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

    expect(outerColor).toBe('rgb(0, 128, 0)');
    expect(innerColor).toBe('rgb(255, 0, 0)');
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

it('prevents bleeding after inner mutations', () => {
  const {scope, cleanup} = bootstrap('bleeding-scope');

  if (!HAS_SHADOWDOM) {
    const outer = document.querySelector('[data-test-name="bleeding-scope"] .b');

    const inner = scope.shadowRoot.querySelector('.b');

    const prev = scope.shadowRoot.querySelector('style');
    prev.textContent += `.b { background-color: yellow; }`;

    setTimeout(() => {
      const innerBg = window.getComputedStyle(inner).getPropertyValue('background-color');
      const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

      const outerBg = window.getComputedStyle(outer).getPropertyValue('background-color');
      const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

      expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(outerBg);
      expect(outerColor).toBe('rgb(0, 128, 0)');

      expect(innerBg).toBe('rgb(255, 255, 0)');
      expect(innerColor).toBe('rgb(255, 0, 0)');
      cleanup();
    });
  }
});
