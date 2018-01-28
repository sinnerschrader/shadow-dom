/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('scopes against high specificity styling', () => {
  const {scope, cleanup} = bootstrap('high-specificity-scope');

  if (!HAS_SHADOWDOM) {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});
