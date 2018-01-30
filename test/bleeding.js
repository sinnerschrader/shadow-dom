/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

beforeEach(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

it('prevents bleeding', done => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    done();
    return;
  }

  const {ctx, scope, cleanup, window} = bootstrap('bleeding-scope');

  setTimeout(() => {
    const outer = ctx.querySelector('.b');
    const outerColor = window.getComputedStyle(outer).getPropertyValue('color');

    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');

    expect(outerColor).toBe('rgb(0, 128, 0)');
    expect(innerColor).toBe('rgb(255, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('prevents bleeding via basic media queries', done => {
  const {scope, cleanup, window} = bootstrap('bleeding-scope-mq-basic');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(255, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('prevents bleeding via complex media queries', done => {
  const {scope, cleanup, window} = bootstrap('bleeding-scope-mq-complex');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(255, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('prevents bleeding via supports queries', done => {
  const {scope, cleanup, window} = bootstrap('bleeding-scope-supports-basic');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    const expected = (window.CSS && ('supports' in CSS)) ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)';

    expect(innerColor).toBe(expected);
    cleanup();
    done();
  }, 100);
});
