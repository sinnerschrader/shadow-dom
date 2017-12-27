import {elementMatches} from './element-matches';

it('throws for missing node', () => {
  expect(() => elementMatches()).toThrowError(/ node must be instance of Node/);
});

it('throws for missing selector', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString('<html><body></body></html>', 'text/html');
  expect(() => elementMatches(doc.body)).toThrowError(/selector must be string/);
});

it('matches as expected', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString('<html><body></body></html>', 'text/html');
  expect(elementMatches(doc.body, 'body')).toBe(true);
});

it('does not match as expected', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString('<html><body></body></html>', 'text/html');
  expect(elementMatches(doc.body, '.foobar')).toBe(false);
});
