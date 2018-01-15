import specificity from 'specificity';

import {elementMatches} from './element-matches';
import {flattenRules} from './flatten-rules';
import {getPathByElement} from './get-path-by-element';
import * as List from './list';
import {pushTo} from './push-to';
import {splitRule} from './split-rule';

const DEFAULT_DOC = '<html><head></head><body></body></html>';

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

