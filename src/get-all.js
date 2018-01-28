import {toArray} from './to-array';

export function getAll() {
  // TODO: filter some props as per spec
  return toArray(window.getComputedStyle(document.body), 0)
    // Remove prefixes
    .filter(prop => prop[0] !== '-');
}
