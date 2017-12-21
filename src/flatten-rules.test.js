import {flattenRules} from './flatten-rules';
import {fixture} from './utils.test';

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
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-basic'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual[0]).toBe(input[0]);
  expect(actual[1]).toBe(input[1]);
});

it('unwraps media queries', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-media'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual).toEqual(jasmine.arrayContaining([
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.a/)}),
    jasmine.objectContaining({selectorText: jasmine.stringMatching(/\.b/)})
  ]));
});

it('strips media queries', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-media'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual).not.toContain(jasmine.objectContaining({
    type: CSSRule.MEDIA_RULE
  }))
});

it('unwraps support queries', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-supports'), 'text/html');
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
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-supports'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;

  const actual = flattenRules(input);

  expect(actual).not.toContain(jasmine.objectContaining({
    type: CSSRule.SUPPORTS_RULE
  }))
});

it('unwraps nested queries', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-nested'), 'text/html');
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
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-fontface'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns PAGE_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-page'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns KEYFRAMES_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-keyframes'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns NAMESPACE_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-namespace'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns COUNTER_STYLE_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-counterstyle'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns DOCUMENT_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-document'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns FONT_FEATURE_VALUES_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-fontfeatures'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns FONT_FEATURE_VALUES_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-fontfeatures'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns VIEWPORT_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-viewport'), 'text/html');
  const input = doc.querySelector('style').sheet.cssRules;
  const expected = input[0];
  const actual = flattenRules(input)[0];
  expect(actual).toBe(expected);
});

it('returns REGION_RULE unchanged', () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixture('flatten-rules-region'), 'text/html');
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
