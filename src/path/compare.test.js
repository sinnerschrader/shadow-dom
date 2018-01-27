import {compare} from './compare';

it('returns 0 for two empty paths', () => {
  expect(compare([], [])).toEqual(0);
});

it('returns 0 for equal paths', () => {
  expect(compare([1, 2, 3], [1, 2, 3])).toEqual(0);
});

it('returns 1 for disjunct paths', () => {
  expect(compare([1], [2])).toEqual(1);
});

it('returns 1 for contained paths', () => {
  expect(compare([1, 1], [1, 2])).toEqual(1);
});

it('returns 1 for longer contained paths', () => {
  expect(compare([1, 1], [1, 2, 1])).toEqual(1);
});

it('returns 1 for shorter paths', () => {
  expect(compare([1, 2, 1], [1, 3])).toEqual(1);
});

it('returns -1 for disjunct paths', () => {
  expect(compare([2], [1])).toEqual(-1);
});

it('returns -1 for contained paths', () => {
  expect(compare([1, 2], [1, 1])).toEqual(-1);
});

it('returns -1 for longer contained paths', () => {
  expect(compare([0, 1, 20, 0, 1, 0, 1], [0, 1, 20, 0, 1])).not.toEqual(0);
});

it('returns -1 for longer contained paths', () => {
  expect(compare([1, 2, 1], [1, 1])).toEqual(-1);
});

it('returns -1 for shorter paths', () => {
  expect(compare([1, 3], [1, 2, 1])).toEqual(-1);
});
