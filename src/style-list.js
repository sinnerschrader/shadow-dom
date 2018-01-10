import specificity from 'specificity';

import {elementMatches} from './element-matches';
import {flattenRules} from './flatten-rules';
import {getPathByElement} from './get-path-by-element';
import * as List from './list';
import {pushTo} from './push-to';

const DEFAULT_DOC = '<html><head></head><body></body></html>';

export function parse(rawSource) {
  if (typeof rawSource === 'undefined') {
    throw new TypeError(`style-tree.parse: missing required parameter source`);
  }

  const source = rawSource === '' ? DEFAULT_DOC : rawSource;

  const doc = typeof rawSource === 'string'
    ? new DOMParser().parseFromString(source, 'text/html')
    : rawSource;

  const rules = List
    .reduce(doc.getElementsByTagName('style'), (acc, style) => pushTo(acc, flattenRules(style.sheet.cssRules)), [])
    .filter(rule => rule.type === CSSRule.STYLE_RULE)
    .reduce((acc, rule) => pushTo(acc, splitRule(rule)), [])
    .sort((a, b) => specificity.compare(a.selectorText, b.selectorText) * -1);

  return List.map(doc.querySelectorAll('*'), (node) => {
    return {
      tagName: node.tagName,
      path: getPathByElement(node, doc),
      rules: rules.filter(rule => elementMatches(node, rule.selectorText)),
      after: rules.filter(rule => elementHasPseudo(node, rule.selectorText, {pseudo: 'after'})),
      before: rules.filter(rule => elementHasPseudo(node, rule.selectorText, {pseudo: 'before'}))
    };
  });
}

function elementHasPseudo(node, selectorText, {pseudo}) {
  const [selector, pseudoElement] = selectorText.split('::');
  if (pseudoElement !== pseudo) {
    return false;
  }
  return elementMatches(node, selector);
}

function splitRule(rule) {
  return rule.selectorText.split(',')
    .map(selectorText => createRule(rule, {selectorText}));
}

function createRule(cssRule, overrides) {
  const node = cssRule.parentStyleSheet.ownerNode;
  const doc = node.ownerDocument;

  return {
    cssText: cssRule.cssText,
    style: styleToMap(cssRule.style),
    selectorText: (overrides.selectorText || cssRule.selectorText).trim(),
    type: cssRule.type,
    parentRule: cssRule.parentRule, // TODO: Do not expose entire parentRules, simplify too
    styleSheetPath: getPathByElement(node, doc)
  };
}

function styleToMap(style) {
  return List.reduce(style, (acc, name) => {
    acc[name] = style.getPropertyValue(name);
    return acc;
  }, {});
}
