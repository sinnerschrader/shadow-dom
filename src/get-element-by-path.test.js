import {getElementByPath} from './get-element-by-path';
import {dom} from './utils.test';

it('throws for missing path', () => {
  expect(() => getElementByPath()).toThrowError(/path must be array of positive integers/);
});

it('throws for missing base', () => {
  expect(() => getElementByPath([])).toThrowError(/base must be instance of Node/);
});

it('returns null for non-existent path', () => {
  const doc = dom('<html></html>');
  expect(getElementByPath([1337], doc)).toBe(null);
});

it('returns null for non-existent nested path', () => {
  const doc = dom('<html></html>');
  expect(getElementByPath([0, 1337, 1337], doc)).toBe(null);
});

it('returns expected document', () => {
  const doc = dom('<html><body></body></html>');
  expect(getElementByPath([], doc)).toBe(doc);
});

it('returns expected element', () => {
  const doc = dom('<html><body><div id="expected"></div></body></html>');
  const expected = doc.getElementById('expected');
  expect(getElementByPath([0, 1, 0], doc)).toBe(expected);
});
