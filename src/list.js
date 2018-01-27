import levery from 'lodash.every';
import lsome from 'lodash.some';

export {
  every,
  filter,
  forEach,
  map,
  reduce,
  some,
};

function every(...args) {
  return levery(...args);
}

function filter(list, ...args) {
  return Array.prototype.filter.call(list, ...args);
}

function forEach(list, ...args) {
  return Array.prototype.forEach.call(list, ...args);
}

function map(list, ...args) {
  return Array.prototype.map.call(list, ...args);
}

function reduce(list, ...args) {
  return Array.prototype.reduce.call(list, ...args);
}

function some(...args) {
  return lsome(...args);
}
