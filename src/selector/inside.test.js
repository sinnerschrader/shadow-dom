import {dom} from '../utils.test';
import {inside} from './inside';

it('returns empty string for uncontained selector', () => {
  const doc = dom('<html><body><div id="a"><p class="a"></p></div></body><html>');
  expect(inside('.b', {doc, path: [0, 1, 0]})).toBe('');
});

it('returns inside fragment of piercing selector', () => {
  const doc = dom('<html><body><div id="a"><p class="a"></p></div></body><html>');
  expect(inside('#a .a', {doc, path: [0, 1, 0]})).toBe('.a');
});

it('returns inside fragment of piercing child selector', () => {
  const doc = dom('<html><body><div id="a"><p class="a"></p></div></body><html>');
  expect(inside('#a > .a', {doc, path: [0, 1, 0]})).toBe('.a');
});

it('returns inside fragment of piercing sibling selector', () => {
  const doc = dom('<html><body><div id="a"></div><div id="b"><p class="a"></p></div></body><html>');
  expect(inside('#a + #b .a', {doc, path: [0, 1, 1]})).toBe('.a');
});

it('returns contained selector unchanged', () => {
  const doc = dom('<html><body><div id="a"><p class="a"></p></div></body><html>');
  expect(inside('.a', {doc, path: [0, 1, 0]})).toBe('.a');
});

it('returns empty string for selector matching container directly', () => {
  const doc = dom('<html><body><div id="a"><p class="a"></p></div></body><html>');
  expect(inside('#a', {doc, path: [0, 1, 0]})).toBe('');
});

it('returns empty string for selector with pseudo class', () => {
  const doc = dom('<html><body><div id="a"><p class="a"></p></div></body><html>');
  expect(inside('#a .a:hover', {doc, path: [0, 1, 0]})).toBe('.a:hover');
});
