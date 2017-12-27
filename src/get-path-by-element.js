export function getPathByElement(element, base = 'body') {
  if (!element) {
    throw new TypeError(`get-path-by-element: element must be instance of Node`);
  }

  const selector = [];
  const isBase = checkBase(base);
  let current = element;

  while (current.parentNode && !isBase(current)) {
    const count = getElementIndex(current);
    selector.unshift(count);
    current = current.parentNode;
  }

  return selector;
}

function checkBase(base) {
  const tagName = typeof base === 'string' ?
    base.toUpperCase() :
    '';

  return typeof base === 'string' ?
    current => current.tagName === tagName :
    current => current === base;
}

function getElementIndex(element) {
  let index = 0;

  while ((element = element.previousElementSibling)) {
    index++;
  }

  return index;
}
