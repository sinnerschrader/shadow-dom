export function parse(source) {
  if (typeof source !== 'string') {
    throw new TypeError(`style-tree.parse: missing required parameter source`);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(source, 'text/html');

  const rules = NodeList.reduce(doc.getElementsByTagName('style'), (acc, style) => {
    Array.prototype.push.apply(style, style.sheet.cssRules);
    return acc;
  }, []);

  return NodeList.map(doc.querySelectorAll('*'), (node) => {
    return {
      tagName: node.tagName,
      path: getPathByElement(node, doc.documentElement),
      rules: []
    };
  });
}

const NodeList = {
  reduce(...args) {
    return Array.prototype.reduce.call(...args);
  },
  map(...args) {
    return Array.prototype.map.call(...args);
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
