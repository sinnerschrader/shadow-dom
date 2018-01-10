import {getPathByElement} from './get-path-by-element';
import {dom} from './utils.test';

it('throws for missing element', () => {
  expect(() => getPathByElement()).toThrowError(/element must be instance of Node/);
});

it('throws for missing base', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(() => getPathByElement(doc.documentElement)).toThrowError(/base must be instance of Node/);
});

it('works for document element', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(getPathByElement(doc.documentElement, doc.documentElement)).toEqual([]);
});

it('works for body', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(getPathByElement(doc.body, doc.body)).toEqual([]);
});

it('works for body with document element base', () => {
  const doc = dom('<html><body></body></html>', 'text/html');
  expect(getPathByElement(doc.body, doc.documentElement)).toEqual([1]);
});

it('returns null for element in other tree', () => {
  const doc = dom('<html><body><div id="base"></div><div><div id="element">Second</div></div></body></html>');
  const el = doc.getElementById('element');
  const base = doc.getElementById('base');

  expect(getPathByElement(el, base)).toEqual(null);
});
