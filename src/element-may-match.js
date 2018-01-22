import {elementMatches} from './element-matches';
import {parseSelector} from './parse-selector';

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

export function elementMayMatch(node, selectorText) {
  if (elementMatches(node, selectorText)) {
    return true;
  }

  // strip pseudo classes from selector to check if it may match
  const selectorNodes = parseSelector(selectorText)
    .filter(node => node.type !== 'pseudo' || SELECTING_PSEUDOS.indexOf(node.value) > -1);

  const baseSelectorText = selectorNodes.map(selectorNode => String(selectorNode)).join('');
  return elementMatches(node, baseSelectorText);
}
