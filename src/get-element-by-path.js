import * as List from './list';

export function getElementByPath(path, base) {
  if (!Array.isArray(path)) {
    throw new TypeError(`path must be array of positive integers, received ${path}`);
  }

  if (!base) {
    throw new TypeError(`base must be instance of Node, received ${base}`);
  }

  return path.reduce((el, index) => {
    // TODO: Verify this is no unduly drag on performance
    const childElements = List.filter(el.childNodes, n => n.nodeType === Node.ELEMENT_NODE);
    return childElements[index] || null;
  }, base);
}
