/* global it, expect */
import {bootstrap} from '../src/utils.test';

it('resets !important rules', done => {
  const {scope, cleanup} = bootstrap('important-outer');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('resets !important rules in pseudo elements', done => {
  const {scope, cleanup} = bootstrap('important-outer-pseudo-elements');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('resets !important rules in pseudo classes', done => {
  const {scope, cleanup} = bootstrap('important-outer-pseudo-classes');

  const inner = scope.shadowRoot.querySelector('input');
  const innerLabel = inner.nextElementSibling;

  setTimeout(() => {
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
    done();
  }, 100);
});

it('uses scoped style for !important props', done => {
  const {scope, cleanup} = bootstrap('important-inner');

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('p');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');

    cleanup();
    done();
  }, 100);
});

it('preserves specifity relations as found', done => {
  const {scope, cleanup} = bootstrap('important-inner-tree');

  setTimeout(() => {
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
    done();
  }, 100);
});

it('protects from !important rules with higher specificity', done => {
  const {scope, cleanup} = bootstrap('important-high-specificity');

  setTimeout(() => {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 128, 0)');

    cleanup();
    done();
  }, 100);
});

it('protects from !important rules with escalating specificity', done => {
  const {scope, cleanup} = bootstrap('important-id-specificity');

  setTimeout(() => {
    const a = scope.shadowRoot.querySelector('.a');
    const color = window.getComputedStyle(a).getPropertyValue('color');
    expect(color).toBe('rgb(0, 0, 0)');

    cleanup();
    done();
  }, 100);
});

it('protects from !important pseudo element rules with escalating specificity', done => {
  const {scope, cleanup} = bootstrap('important-id-specificity-pseudo');

  setTimeout(() => {
    const a = scope.shadowRoot.querySelector('.a');
    const aColor = window.getComputedStyle(a, '::before').getPropertyValue('color');
    expect(aColor).toBe('rgb(0, 128, 0)');

    cleanup();
    done();
  }, 100);
});

it('protects from !important pseudo classes with escalating specificity', done => {
  const {scope, cleanup} = bootstrap('important-id-specificity-pseudo-classes');

  setTimeout(() => {
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
    done();
  }, 100);
});

it('protects from !important rules in media queries <= 500px', done => {
  const {scope, viewport, cleanup} = bootstrap('important-outer-mq', {name: 'mq-se-500'});

  viewport.set(499);

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 128, 0)');

    cleanup();
    viewport.reset();
    done();
  }, 100);
});

it('protects from !important rules in media queries > 500px', done => {
  const {scope, viewport, cleanup} = bootstrap('important-outer-mq', {name: 'mq-g-500'});

  viewport.set(501);

  setTimeout(() => {
    const inner = scope.shadowRoot.querySelector('.b');
    const innerColor = window.getComputedStyle(inner).getPropertyValue('color');
    expect(innerColor).toBe('rgb(0, 0, 255)');

    cleanup();
    viewport.reset();
    done();
  }, 100);
});
