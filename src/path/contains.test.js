import {contains} from './contains';

it('throws for missing path', () => {
  expect(() => contains()).toThrowError(/path must be array of integers/);
});

it('throws for missing base', () => {
  expect(() => contains([])).toThrowError(/base must be array of integers/);
});

it('returns true for two empty paths', () => {
  expect(contains([], [])).toEqual(true);
});

it('returns true for equal paths', () => {
  expect(contains([1, 2, 3], [1, 2, 3])).toEqual(true);
});

it('returns true for contained path', () => {
  expect(contains([1, 2, 3, 0, 3], [1, 2, 3])).toEqual(true);
});

it('returns false for uncontained path', () => {
  expect(contains([1, 2, 4, 0, 3], [1, 2, 3])).toEqual(false);
});
