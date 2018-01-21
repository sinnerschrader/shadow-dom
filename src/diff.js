import * as Path from './path';

export function diff(styleNode, mountPath) {
  const inside = styleNode.rules.filter(r => Path.contains(r.styleSheetPath, mountPath));
  const insideImporant = styleNode.important.filter(d => Path.contains(d.rule.styleSheetPath, mountPath));

  const actual = computeStyles(styleNode.rules, styleNode.important);
  const expected = computeStyles(inside, insideImporant);

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

function computeStyles(rules, importantDeclarations) {
  const computed = rules.reduce((acc, rule) => {
    Object.keys(rule.style)
      .forEach(prop => {
        const important = importantDeclarations.find(d => d.propName === prop);

        if (important) {
          acc[prop] = important.rule.style[prop];
          acc[prop].rule = important.rule;
        }

        if (!acc.hasOwnProperty(prop)) {
          acc[prop] = rule.style[prop];
          acc[prop].rule = rule;
        }
      });
    return acc;
  }, {});

  return computed;
}

