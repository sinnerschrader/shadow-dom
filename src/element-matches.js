export function elementMatches(node, selector) {
  if (!node) {
    throw new TypeError('elementMatches: node must be instance of Node');
  }

  if (typeof selector !== 'string') {
    throw new TypeError(`elementMatches: selector must be string, received "${selector}"`);
  }

  if (HTMLElement.prototype.matches) {
    return node.matches(selector);
  }

  if (HTMLElement.prototype.msMatchesSelector) {
    return node.msMatchesSelector(selector);
  }

  throw new TypeError('elementMatches: node.matches and node.msMatchesSelector are not supported');
}
