export {
  filter,
  map,
  reduce,
};

function filter(list, ...args) {
  return Array.prototype.filter.call(list, ...args);
}

function map(list, ...args) {
  return Array.prototype.map.call(list, ...args);
}

function reduce(list, ...args) {
  return Array.prototype.reduce.call(list, ...args);
}
