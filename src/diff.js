import {inPath} from './in-path';

export function diff(styleNode, mountPath) {
  const inside = styleNode.rules.filter(r => inPath(r.styleSheetPath, mountPath));

  const actual = styleNode.rules.reduce((acc, rule) => {
    Object.keys(rule.style)
      .forEach(prop => {
        if (!(prop in acc) || rule.style[prop].priority === 'important') {
          acc[prop] = rule.style[prop];
          acc[prop].rule = rule;
        }
      });
    return acc;
  }, {});

  const expected = inside.reduce((acc, rule) => {
    Object.keys(rule.style)
      .forEach(prop => {
        if (!(prop in acc) || rule.style[prop].priority === 'important') {
          acc[prop] = rule.style[prop];
          acc[prop].rule = rule;
        }
      });
    return acc;
  }, {});

  return Object.keys(actual)
    .map(prop => {
      const a = actual[prop];
      const e = expected[prop];
      const av = a ? a.value : null;
      const ev = e ? e.value : null;

      if (av === ev) {
        return null;
      }

      // outer styles overrides local style illegally
      if (ev) {
        return {
          type: 'add',
          prop,
          value: ev,
          priority: (ev.priority || a.priority) === 'important' ? '!important' : '',
          rule: e.rule,
          outerRule: a.rule
        };
      }

      // outer style adds new prop illegally
      if (av) {
        return {
          type: 'subtract',
          prop,
          value: 'initial',
          priority: a.priority === 'important' ? '!important' : '',
          rule: inside[0],
          outerRule: a.rule
        };
      }
    })
    .filter(Boolean);
}
