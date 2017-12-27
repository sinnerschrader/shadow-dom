import {elementMatches} from './element-matches';
import {flattenRules} from './flatten-rules';
import {getPathByElement} from './get-path-by-element';
import * as NodeList from './node-list';
import {pushTo} from './push-to';

const DEFAULT_DOC = '<html><head></head><body></body></html>';

export function parse(rawSource) {
  if (typeof rawSource !== 'string') {
    throw new TypeError(`style-tree.parse: missing required parameter source`);
  }

  const source = rawSource === '' ? DEFAULT_DOC : rawSource;
  const parser = new DOMParser();
  const doc = parser.parseFromString(source, 'text/html');

  const rules = NodeList
    .reduce(doc.getElementsByTagName('style'), (acc, style) => pushTo(acc, flattenRules(style.sheet.cssRules)), []);

  return NodeList.map(doc.querySelectorAll('*'), (node) => {
    return {
      tagName: node.tagName,
      path: getPathByElement(node, doc.documentElement),
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
