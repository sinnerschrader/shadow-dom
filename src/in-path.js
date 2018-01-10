export function inPath(path, base) {
  if (!Array.isArray(path)) {
    throw new TypeError(`path must be array of integers, received ${path}`);
  }
}
