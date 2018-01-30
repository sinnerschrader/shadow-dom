/* global it, expect */
import {bootstrap} from '../src/utils.test';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('interrupts the cascade', done => {
  const {scope, cleanup, window} = bootstrap('basic-scope');

  setTimeout(() => {
    const b = scope.shadowRoot.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('enforces basic cascade scoping for pseudo elements', done => {
  const {scope, cleanup, window} = bootstrap('basic-scope-pseudo-elements');

  const a = scope.shadowRoot.querySelector('.a');

  setTimeout(() => {
    const before = window.getComputedStyle(a, ':before').getPropertyValue('height');
    const after = window.getComputedStyle(a, ':after').getPropertyValue('height');

    expect(['0px', 'auto']).toContain(before);
    expect(['0px', 'auto']).toContain(after);

    cleanup();
    done();
  }, 100);
});

it('enforces basic cascade scoping for pseudo classes', done => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    done();
    return;
  }

  const {cleanup, ctx, scope, window} = bootstrap('basic-scope-pseudo-classes');

  const outer = ctx.querySelector(`input`);
  const inner = scope.shadowRoot.querySelector('input');

  const outerLabel = outer.nextElementSibling;
  const innerLabel = inner.nextElementSibling;

  setTimeout(() => {
    {
      const outerColor = window.getComputedStyle(outerLabel).getPropertyValue('color');
      const innerColor = window.getComputedStyle(innerLabel).getPropertyValue('color');
      expect(outerColor).toBe('rgb(255, 165, 0)');
      expect(innerColor).toBe('rgb(0, 0, 255)');
    }

    outer.setAttribute('checked', true);
    inner.setAttribute('checked', true);

    setTimeout(() => {
      const outerColor = window.getComputedStyle(outerLabel).getPropertyValue('color');
      const innerColor = window.getComputedStyle(innerLabel).getPropertyValue('color');
      expect(outerColor).toBe('rgb(255, 0, 0)');
      expect(innerColor).toBe('rgb(0, 128, 0)');
      cleanup();
      done();
    });
  }, 100);
});

it('cascade scoping respects default styling of html elements', done => {
  const {cleanup, scope, window} = bootstrap('basic-default-styles');

  const a = scope.shadowRoot.querySelector('a');
  const b = scope.shadowRoot.querySelector('b');
  const address = scope.shadowRoot.querySelector('address');
  const mark = scope.shadowRoot.querySelector('mark');

  setTimeout(() => {
    const aDecoration = window.getComputedStyle(a).getPropertyValue('text-decoration');
    const bWeight = window.getComputedStyle(b).getPropertyValue('font-weight');
    const addressFontStyle = window.getComputedStyle(address).getPropertyValue('font-style');
    const markBackground = window.getComputedStyle(mark).getPropertyValue('background-color');

    expect(['underline', 'underline solid rgb(0, 0, 238)']).toContain(aDecoration);
    expect(['700', 'bold']).toContain(bWeight);
    expect(addressFontStyle).toBe('italic');
    expect(markBackground).toBe('rgb(255, 255, 0)');

    cleanup();
    done();
  }, 100);
});

it('cascade scoping respects styling of inner scope', done => {
  const {cleanup, scope, window} = bootstrap('inner-scope');

  setTimeout(() => {
    const b = scope.shadowRoot.querySelector('.b');
    const color = window.getComputedStyle(b).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');

    cleanup();
    done();
  }, 100);
});

it('cascade scoping respects styling of inner scope pseudo elements', done => {
  // TODO: Fix test for Webkit/Blink and enable
  if (HAS_SHADOWDOM) {
    done();
    return;
  }

  const {cleanup, scope, window} = bootstrap('inner-scope-pseudo-elements');

  setTimeout(() => {
    const b = scope.shadowRoot.querySelector('.b');
    const beforeColor = window.getComputedStyle(b, ':before').getPropertyValue('color');
    expect(beforeColor).toBe('rgb(0, 128, 0)');

    cleanup();
    done();
  }, 100);
});
