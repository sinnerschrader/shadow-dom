export function toArray(input) {
  if (input === null || typeof input === 'undefined') {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  if (typeof Array.from === 'function') {
    return Array.isArray(input)
      ? input
      : Array.from(input);
  }

  return Array.isArray(input)
    ? input
    : Array.prototype.slice.call(input, 0);
}
