export function fromElement(element, base) {
  if (!element) {
    throw new TypeError(`from-element: element must be instance of Node`);
  }

  if (!base) {
    throw new TypeError(`from-element: base must be instance of Node`);
  }

  let pre = element;

  while (pre.parentNode && pre !== base) {
    pre = pre.parentNode;
    continue;
  }

  // Went through all parents but the last match
  // is not the indicated root node. This means "base"
  // does not contain "pre", return null in this case
  if (pre !== base) {
    return null;
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
