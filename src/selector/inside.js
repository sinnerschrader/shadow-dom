import find from 'lodash.find';

import * as List from '../list';
import * as Path from '../path';
import {parseSelector} from '../parse-selector';

export function inside(selector, context) {
  const {doc, path} = context;
  const selectors = unfoldSelector(selector);
  const outer = find(selectors, s => !containsMatching(s.selector, {doc, path}));

  if (!outer) {
    return selector;
  }

  const inside = List.filter(selectors[0].nodes, n => outer.nodes.indexOf(n) === -1);

  return inside
    // Filter leading and trailing CSS combinators
    .filter((n, i) => n.type !== 'combinator' || (i !== 0 && i !== inside.length - 1))
    .reduce((acc, n) => {
      acc += String(n);
      return acc;
    }, '');
}

function containsMatching(selector, {doc, path}) {
  return List.some(doc.querySelectorAll(selector), e => {
    const p = Path.fromElement(e, doc);
    return Path.compare(p, path) !== 0 && Path.contains(p, path);
  });
}

function unfoldSelector(input) {
  const nodes = parseSelector(input);

  const results = [];

  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const last = nodes[i];

    if (last.type === 'combinator') {
      continue;
    }

    const result = {
      selector: '',
      nodes: []
    };

    for (let j = 0; j <= i; j += 1) {
      const n = nodes[j];
      if (n.type !== 'pseudo') {
        result.selector += String(n);
      }
      result.nodes.push(n);
    }

    if (result.selector.length > 0) {
      results.push(result);
    }
  }

  return results;
}
