import {elementMatches} from './element-matches';
import {dom} from './utils.test';

it('throws for missing node', () => {
  expect(() => elementMatches()).toThrowError(/ node must be instance of Node/);
});

it('throws for missing selector', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(() => elementMatches(doc.body)).toThrowError(/selector must be string/);
});

it('matches as expected', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(elementMatches(doc.body, 'body')).toBe(true);
});

it('does not match as expected', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(elementMatches(doc.body, '.foobar')).toBe(false);
});
