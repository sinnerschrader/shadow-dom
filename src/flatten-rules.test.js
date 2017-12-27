import {flattenRules} from './flatten-rules';
import {dom, fixture} from './utils.test';

it('throws for undefined', () => {
  expect(() => flattenRules()).toThrow();
});

it('throws for null', () => {
  expect(() => flattenRules(null)).toThrow();
});

it('returns [] input unchanged', () => {
  const expected = [];
  const actual = flattenRules(expected);
  expect(expected).toBe(actual);
});

it('returns CSSRule[] for CSSRuleList', () => {
  const doc = dom(fixture('flatten-rules-basic'));
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual[0]).toBe(input[0]);
  expect(actual[1]).toBe(input[1]);
});

it('unwraps media queries', () => {
  const doc = dom(fixture('flatten-rules-media'));
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual).toEqual(jasmine.arrayContaining([
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.a/)}),
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.b/)})
  ]));
});

it('strips media queries', () => {
  const doc = dom(fixture('flatten-rules-media'));
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual).not.toContain(jasmine.objectContaining({
    type: CSSRule.MEDIA_RULE
  }))
});

it('unwraps support queries', () => {
  const doc = dom(fixture('flatten-rules-supports'));
  const input = doc.querySelector('style').sheet.cssRules;

  // Bail out if @supports unsupported
  if (!input[0] || input[0].type === CSSRule.UNKNOWN_RULE) {
    return;
  }

  const actual = flattenRules(input);

  expect(actual).toEqual(jasmine.arrayContaining([
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.a/)}),
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.b/)})
  ]));
});

it('strips supports queries', () => {
  const doc = dom(fixture('flatten-rules-supports'));
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual).not.toContain(jasmine.objectContaining({
    type: CSSRule.SUPPORTS_RULE
  }))
});

it('unwraps nested queries', () => {
  const doc = dom(fixture('flatten-rules-nested'));
  const input = doc.querySelector('style').sheet.cssRules;

  // Bail out if @supports unsupported
  if (!input[3] || input[3].type === CSSRule.UNKNOWN_RULE) {
    return;
  }

  const actual = flattenRules(input);

  expect(actual).toEqual(jasmine.arrayContaining([
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.a/)}),
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.b/)}),
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.c/)}),
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.d/)})
  ]));
});

it('returns FONT_FACE_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-fontface'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns PAGE_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-page'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns KEYFRAMES_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-keyframes'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns NAMESPACE_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-namespace'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns COUNTER_STYLE_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-counterstyle'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns DOCUMENT_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-document'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns FONT_FEATURE_VALUES_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-fontfeatures'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns VIEWPORT_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-viewport'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns REGION_RULE unchanged', () => {
  const doc = dom(fixture('flatten-rules-region'));
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns REGION_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-unknown'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns CHARSET_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-charset'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});
