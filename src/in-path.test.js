import {inPath} from './in-path';

it('throws for missing path', () => {
  expect(() => inPath()).toThrowError(/path must be array of integers/);
});

it('throws for missing base', () => {
  expect(() => inPath([])).toThrowError(/base must be array of integers/);
});

it('returns true for two empty paths', () => {
  expect(inPath([], [])).toEqual(true);
});

it('returns true for equal paths', () => {
  expect(inPath([1, 2, 3], [1, 2, 3])).toEqual(true);
});

it('returns true for contained path', () => {
  expect(inPath([1, 2, 3, 0, 3], [1, 2, 3])).toEqual(true);
});

it('returns false for uncontained path', () => {
  expect(inPath([1, 2, 4, 0, 3], [1, 2, 3])).toEqual(false);
});