/* global it, expect */
import {dom} from './utils.test';
import {shadowDom} from './shadow-dom';

const HAS_SHADOWDOM = ('attachShadow' in document.createElement('div'));

it('should exist', () => {
  expect(shadowDom).toBeDefined();
});

it('has a shadowRoot property', () => {
  const doc = dom();
  const actual = shadowDom(doc.body);
  expect(actual.shadowRoot).toBeDefined();
});

it('is native if supported', () => {
  if (HAS_SHADOWDOM) {
    const doc = dom();
    const actual = shadowDom(doc.body);
    expect(actual.shadowRoot.toString()).toBe('[object ShadowRoot]');
  }
});

it('is plain element if unsupported', () => {
  if (!HAS_SHADOWDOM) {
    const doc = dom();
    const actual = shadowDom(doc.body);
    expect(actual.shadowRoot.toString()).toBe('[object HTMLDivElement]');
  }
});
