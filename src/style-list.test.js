import find from 'lodash.find';
import {parse} from './style-list';
import {dom, fixture} from './utils.test';

it('works for empty string', () => {
  expect(() => parse(dom(''))).not.toThrowError();
});

it('creates doc for empty string', () => {
  const actual = parse(dom(''));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'HTML', path: [0]}));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'HEAD', path: [0, 0]}));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'BODY', path: [0, 1]}));
});

it('creates doc with expected elements', () => {
  const html = fixture('tree-basic');
  const actual = parse(dom(html));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'DIV', path: [0, 1, 0]}));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'SPAN', path: [0, 1, 1]}));
});

it('matches basic rules as expected', () => {
  const html = fixture('tree-basic-rules');
  const actual = parse(dom(html));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'DIV',
    path: [0, 1, 0],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'div'})
    ])
  }));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'SPAN',
    path: [0, 1, 1],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'span'})
    ])
  }));
});

it('matches media query rules as expected', () => {
  const html = fixture('tree-basic-media');
  const actual = parse(dom(html));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'DIV',
    path: [0, 1, 0],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: '.a'})
    ])
  }));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'SPAN',
    path: [0, 1, 1],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: '.b'})
    ])
  }));
});

it('attaches pseudo elements to hosts', () => {
  const html = fixture('tree-pseudo-elements');
  const actual = parse(dom(html));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'DIV',
    path: [0, 1, 0],
    before: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'div::before'})
    ])
  }));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'SPAN',
    path: [0, 1, 1],
    after: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'span::after'})
    ])
  }));
});

it('sorts rules descending by specificity', () => {
  const html = fixture('tree-specificity');
  const div = find(parse(dom(html)), i => i.tagName === 'DIV');
  const selectors = div.rules.map(r => r.selectorText);
  expect(selectors).toEqual(['#a', '.a.a', '[data-a]', '.a']);
});

it('sorts pseudo element rules descending by specificity', () => {
  const html = fixture('tree-pseudo-element-specificity');
  const list = parse(dom(html));
  const div = find(list, i => i.tagName === 'DIV');
  const span = find(list, i => i.tagName === 'SPAN');
  const after = div.before.map(r => r.selectorText);
  const before = span.after.map(r => r.selectorText);

  expect(after).toEqual(['.b.b.b + .a::before', 'div::before']);
  expect(before).toEqual(['.b.b::after', 'span::after', 'span::after']);
});

it('honors source order', () => {
  const list = parse(dom(fixture('tree-source-order')));
  const span = find(list, i => i.tagName === 'SPAN');
  const colors = span.rules.map(r => r.style.color.value);
  expect(colors).toEqual(['green', 'red']);
});

it('splits rules with multiple selectors', () => {
  const list = parse(dom(fixture('tree-multiple-selectors')));
  const span = find(list, i => i.tagName === 'SPAN');

  const selectors = span.rules.map(r => r.selectorText);
  expect(selectors).toContain(jasmine.arrayContaining([
    '.a',
    'span',
    'span.a',
  ]));
});

it('records expected path for containing stylesheets', () => {
  const list = parse(dom(fixture('tree-stylesheet-paths')));
  const a = find(list, i => i.tagName === 'X-FIXTURE');

  const id = find(a.rules, r => r.selectorText === '#a');
  const className = find(a.rules, r => r.selectorText === '.a');
  const attr = find(a.rules, r => r.selectorText === '[data-a]');

  expect(id.styleSheetPath).toEqual([0, 1, 0]);
  expect(className.styleSheetPath).toEqual([0, 1, 1, 0, 0]);
  expect(attr.styleSheetPath).toEqual([0, 1, 2]);
});
