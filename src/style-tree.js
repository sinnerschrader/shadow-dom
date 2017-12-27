import {elementMatches} from './element-matches';
import {flattenRules} from './flatten-rules';
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
      rules: rules.filter(rule => elementMatches(node, rule.selectorText))
    };
  });
}

const NodeList = {
  reduce(list, ...args) {
    return Array.prototype.reduce.call(list, ...args);
  },
  map(list, ...args) {
    return Array.prototype.map.call(list, ...args);
  }
}

function getPathByElement(element, base) {
  const selector = [];
  let current = element;

  while (current.parentNode && base ? current !== base : current.tagName.toLowerCase() !== 'body') {
    const count = getElementIndex(current);
    selector.unshift(count);
    current = current.parentNode;
  }

  return selector;
}

function getElementIndex(element) {
  let index = 0;

  while ((element = element.previousElementSibling)) {
    index++;
  }

  return index;
}
