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
