/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

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
