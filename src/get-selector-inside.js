import * as List from './list';
import * as Path from './path';
import {parseSelector} from './parse-selector';

export function getSelectorInside(selector, {doc, elPath}) {
  const selectors = parseSelector(selector)
    .reverse()
    .filter(node => node.type !== 'pseudo')
    .map((node, index, nodes) => nodes.slice(index).reverse().map(n => String(n)).join(''))
    .filter(selector => {
      const trimmed = selector.trim();
      const last = trimmed[trimmed.length - 1];
      return last !== '~' && last !== '+' && last !== '>';
    });

  const index = selectors.findIndex(s => !containsMatching(s, {doc, elPath}));
  const nonMatch = selectors[index];

  const regex = new RegExp(`^${nonMatch}`);
  const result = selector.replace(regex, '');

  if (!result) {
    return selector;
  }

  return result;
}

function containsMatching(selector, {doc, elPath}) {
  return List.some(doc.querySelectorAll(selector), e => Path.contains(Path.fromElement(e, doc), elPath));
}
