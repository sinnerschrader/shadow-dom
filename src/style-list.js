import specificity from 'specificity';

import {elementMatches} from './element-matches';
import {flattenRules} from './flatten-rules';
import {getPathByElement} from './get-path-by-element';
import * as List from './list';
import {parseSelector} from './parse-selector';
import {pushTo} from './push-to';
import {splitRule} from './split-rule';

const DEFAULT_DOC = '<html><head></head><body></body></html>';

const SELECTING_PSEUDOS = [
  ':first',
  ':first-child',
  ':first-of-type',
  ':last-child',
  ':last-of-type',
  ':not',
  ':nth-child',
  ':nth-last-child',
  ':nth-last-of-type',
  ':nth-of-type',
  ':only-child',
  ':only-of-type',
  ':root',
  ':scope'
];

export function parse(doc) {
  const rules = List
    .reduce(doc.getElementsByTagName('style'), (acc, style) => pushTo(acc, flattenRules(style.sheet.cssRules)), [])
    .filter(rule => rule.type === CSSRule.STYLE_RULE)
    .reduce((acc, rule) => pushTo(acc, splitRule(rule)), [])
    .sort((a, b) => specificity.compare(a.selectorText, b.selectorText) * -1);

  return List.map(doc.querySelectorAll('*'), (node) => {
    return {
      tagName: node.tagName,
      path: getPathByElement(node, doc),
      rules: rules.filter(rule => elementMayMatch(node, rule.selectorText)),
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

function elementMayMatch(node, selectorText) {
  if (elementMatches(node, selectorText)) {
    return true;
  }

  // strip pseudo classes from selector to check if it may match
  const selectorNodes = parseSelector(selectorText)
    .filter(node => node.type !== 'pseudo' || SELECTING_PSEUDOS.indexOf(node.value) > -1);

  const baseSelectorText = selectorNodes.map(selectorNode => String(selectorNode)).join('');
  return elementMatches(node, baseSelectorText);
}
