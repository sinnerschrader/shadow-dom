export function getPathByElement(element, base) {
  if (!element) {
    throw new TypeError(`get-path-by-element: element must be instance of Node`);
  }

  if (!base) {
    throw new TypeError(`get-path-by-element: base must be instance of Node`);
  }

  const path = [];
  let current = element;

  while (current.parentNode && current !== base) {
    const count = getElementIndex(current);
    path.unshift(count);
    current = current.parentNode;
  }

  return path;
}

function getElementIndex(element) {
  let index = 0;

  while ((element = element.previousElementSibling)) {
    index++;
  }

  return index;
}
