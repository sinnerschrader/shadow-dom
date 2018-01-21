export function contains(path, base) {
  if (!Array.isArray(path)) {
    throw new TypeError(`path must be array of integers, received ${path}`);
  }

  if (!Array.isArray(base)) {
    throw new TypeError(`base must be array of integers, received ${base}`);
  }

  return base.every((n, i) => path[i] === n);
}
