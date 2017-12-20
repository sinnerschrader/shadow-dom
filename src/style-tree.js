export function parse(source) {
  if (typeof source !== 'string') {
    throw new TypeError(`style-tree.parse: missing required parameter source`);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(source, 'text/html');

  const rules = NodeList
    .reduce(doc.getElementsByTagName('style'), (acc, style) => pushTo(acc, toArray(style.sheet.cssRules)), []);

  return NodeList.map(doc.querySelectorAll('*'), (node) => {
    return {
      tagName: node.tagName,
      path: getPathByElement(node, doc.documentElement),
      rules: rules.filter(rule => node.matches(rule.selectorText))
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

function pushTo(to, from) {
  Array.prototype.push.apply(to, from);
  return to;
}

function toArray(input) {
  return Array.prototype.slice.call(input, 0);
}
