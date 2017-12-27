export {
  reduce,
  map
};

function map(list, ...args) {
  return Array.prototype.map.call(list, ...args);
}

function reduce(list, ...args) {
  return Array.prototype.reduce.call(list, ...args);
}
