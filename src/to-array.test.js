import {toArray} from './to-array';
import {fixture} from './utils.test';

it('throws for undefiend', () => {
  expect(() => toArray()).toThrow();
});

it('throws for null', () => {
  expect(() => toArray(null)).toThrow();
});

it('return input for arrays', () => {
  const input = [];
  expect(toArray(input)).toBe(input);
});

it('return input with items for arrays', () => {
  const item = {a: 'a'};
  expect(toArray([item])).toContain(item);
});

it('returns array for array-like', () => {
  const item = {a: 'a'};
  const input = {0: {a: 'a'}, length: 1};
  expect(toArray(input)).toContain(item);
});

it('returns Nodes[] for NodeList', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('to-array'), 'text/html');
  const input = doc.querySelectorAll('*');
  const result = toArray(input);
  expect(input[0]).toBe(result[0]);
  expect(input[0] instanceof Node);
  expect(input[1]).toBe(result[1]);
});

it('returns CSSRule[] for CSSRuleList', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('to-array'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const result = toArray(input);
  expect(input[0]).toBe(result[0]);
  expect(input[0] instanceof CSSRule);
  expect(input[1]).toBe(result[1]);
  expect(input[2]).toBe(result[2]);
});

it('returns string[] for CSSStyleDeclaration', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('to-array'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules[0].style;
  const result = toArray(input);
  expect(input[0]).toBe(result[0]);
  expect(typeof result[0]).toBe('string');
});
