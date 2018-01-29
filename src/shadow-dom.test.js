/* global it, expect */
import {dom} from './utils.test';
import {shadowDom} from './shadow-dom';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('should exist', () => {
  expect(shadowDom).toBeDefined();
});

it('has a shadowRoot property', () => {
  const document = dom();
  const actual = shadowDom(document.body, {document});
  expect(actual.shadowRoot).toBeDefined();
});

it('is native if supported', () => {
  if (HAS_SHADOWDOM) {
    const document = dom();
    const actual = shadowDom(document.body, {document});
    expect(actual.shadowRoot.toString()).toBe('[object ShadowRoot]');
  }
});

it('is plain element if unsupported', () => {
  if (!HAS_SHADOWDOM) {
    const document = dom();
    const actual = shadowDom(document.body, {document});
    expect(actual.shadowRoot.toString()).toBe('[object HTMLDivElement]');
  }
});

it('is plain element if forced', () => {
  const document = dom();
  const actual = shadowDom(document.body, {document, forced: true});
  expect(actual.shadowRoot.toString()).toBe('[object HTMLDivElement]');
});

it('exposes innerHTML', () => {
  const document = dom();
  const actual = shadowDom(document.body, {document, forced: true});
  expect(typeof actual.shadowRoot.innerHTML).toBe('string');
});

it('exposes appendChild', () => {
  const document = dom();
  const actual = shadowDom(document.body, {document, forced: true});
  expect(typeof actual.shadowRoot.appendChild).toBe('function');
});
