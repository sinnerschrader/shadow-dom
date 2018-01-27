import {pushTo} from './push-to';
import {toArray} from './to-array';

export function flattenRules(rules) {
  const list = toArray(rules);

  if (list.length === 0) {
    return list;
  }

  return list.reduce((acc, r) => {
    switch (r.type) {
      case CSSRule.MEDIA_RULE:
      case CSSRule.SUPPORTS_RULE:
        return pushTo(acc, flattenRules(toArray(r.cssRules, 0)));
      default:
        return pushTo(acc, [r]);
    }
  }, []);
}
