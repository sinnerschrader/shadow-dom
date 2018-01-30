/* global it, expect */
import {bootstrap} from '../src/utils.test';

it('encapsulates against selectors matching mount point', done => {
  const {cleanup, scope, window} = bootstrap('mount-selector');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');

    cleanup();
    done();
  }, 100);
});

it('handles invalid css selectors gracefully', done => {
  const {cleanup} = bootstrap('invalid-selectors');
  cleanup();
  done();
});
