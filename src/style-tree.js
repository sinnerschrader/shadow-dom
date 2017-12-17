export function parse(source) {
  if (typeof source !== 'string') {
    throw new TypeError(`style-tree.parse: missing required parameter source`);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(source, 'text/html');
}
