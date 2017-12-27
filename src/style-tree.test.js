import {parse} from './style-tree';
import {fixture} from './utils.test';

it('throws for empty input', () => {
  expect(() => parse()).toThrowError(/missing required parameter source/);
});

it('works for empty string', () => {
  expect(() => parse('')).not.toThrowError();
});

it('creates doc for empty string', () => {
  const actual = parse('');
  expect(actual).toContain(jasmine.objectContaining({tagName: 'HTML', path: []}));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'HEAD', path: [0]}));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'BODY', path: [1]}));
});

it('creates doc with expected elements', () => {
  const html = fixture('tree-basic');
  const actual = parse(html);
  expect(actual).toContain(jasmine.objectContaining({tagName: 'DIV', path: [1, 0]}));
  expect(actual).toContain(jasmine.objectContaining({tagName: 'SPAN', path: [1, 1]}));
});

it('matches basic rules as expected', () => {
  const html = fixture('tree-basic-rules');
  const actual = parse(html);

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'DIV',
    path: [1, 0],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'div'})
    ])
  }));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'SPAN',
    path: [1, 1],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'span'})
    ])
  }));
});

it('matches media query rules as expected', () => {
  const html = fixture('tree-basic-media');
  const actual = parse(html);

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'DIV',
    path: [1, 0],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: '.a'})
    ])
  }));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'SPAN',
    path: [1, 1],
    rules: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: '.b'})
    ])
  }));
});

it('attaches pseudo elements to hosts', () => {
  const html = fixture('tree-pseudo-elements');
  const actual = parse(html);

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'DIV',
    path: [1, 0],
    before: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'div::before'})
    ])
  }));

  expect(actual).toContain(jasmine.objectContaining({
    tagName: 'SPAN',
    path: [1, 1],
    after: jasmine.arrayContaining([
      jasmine.objectContaining({selectorText: 'span::after'})
    ])
  }));
});
