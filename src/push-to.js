export function pushTo(target, amendment) {
  Array.prototype.push.apply(target, amendment);
  return target;
}
