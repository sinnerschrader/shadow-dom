/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('encapsulates against selectors matching mount point', () => {
  const {scope, cleanup} = bootstrap('mount-selector');

  if (!HAS_SHADOWDOM) {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');
  }

  cleanup();
});

it('protects default-hidden elements against revealing styles', () => {
  const {cleanup} = bootstrap('hidden-elements');

  if (!HAS_SHADOWDOM) {
    const inner = Array.prototype.slice.call(document.querySelectorAll('[data-testname="hidden-elements"] .shadow-dom style, [data-testname="hidden-elements"] .shadow-dom script'), 0);
    const visible = inner.filter(i => i.offsetParent !== null);
    expect(visible.length).toBe(0);
  }

  cleanup();
});

it('handles invalid css selectors gracefully', () => {
  const {cleanup} = bootstrap('invalid-selectors');
  cleanup();
});
