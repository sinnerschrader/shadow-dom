import {pushTo} from './push-to';

it('returns target', () => {
  const target = [];
  const actual = pushTo(target);
  expect(actual).toBe(target);
});

it('works for empty arrays', () => {
  const actual = pushTo([], []);
  expect(actual).toEqual([]);
});

it('adds item from amendment', () => {
  const item = {a: 'a'};
  const actual = pushTo([], [item]);
  expect(actual).toContain(item);
});

it('adds all items from amedment', () => {
  const actual = pushTo(['x', 'y', 'z'], ['a', 'b', 'c', 'd', 'e', 'f']);
  expect(actual).toEqual(['x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f']);
});

