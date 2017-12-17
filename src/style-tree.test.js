import {parse} from './style-tree';

it('throws for empty input', () => {
  expect(() => parse()).toThrowError(/missing required parameter source/);
});

it('works for empty string', () => {
  expect(() => parse('')).not.toThrowError();
});

it('creates doc for empty string', () => {
  const actual = parse('');
  expect(actual).toContain({tagName: 'HTML', path: [], rules: []});
  expect(actual).toContain({tagName: 'HEAD', path: [0], rules: []});
  expect(actual).toContain({tagName: 'BODY', path: [1], rules: []});
});
