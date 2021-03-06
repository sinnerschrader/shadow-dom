import find from 'lodash.find';
import * as initials from './initials';
import * as Path from './path';

export function diff(styleNode, {mountPath}) {
  const inside = styleNode.rules.filter(r => Path.contains(r.styleSheetPath, mountPath));
  const insideImportant = styleNode.important.filter(d => Path.contains(d.rule.styleSheetPath, mountPath));

  const actual = computeStyles(styleNode.rules, styleNode.important);
  const expected = computeStyles(inside, insideImportant);

  return Object.keys(actual)
    .reduce((acc, prop) => {
      const a = actual[prop];
      const e = expected[prop];
      const av = a ? a.value : null;
      const ev = e ? e.value : null;

      if (av === ev) {
        return acc;
      }

      // Outer styles overrides local style illegally.
      if (ev) {
        const prio = (e.priority || a.priority) === 'important';

        acc.push({
          type: 'add',
          prop,
          value: ev,
          priority: prio ? '!important' : '',
          rule: e.rule,
          outerRule: a.rule,
          selectorText: e.rule.selectorText
        });
      }

      // Outer style adds new prop illegally.
      if (av && !ev) {
        acc.push({
          type: 'subtract',
          prop,
          value: initials.get(prop),
          priority: a.priority === 'important' ? '!important' : '',
          rule: a.rule,
          selectorText: a.rule.selectorText,
          outerRule: a.rule
        });
      }

      return acc;
    }, []);
}

function computeStyles(rules, importantDeclarations) {
  const computed = rules.reduce((acc, rule) => {
    Object.keys(rule.style)
      .forEach(prop => {
        const important = find(importantDeclarations, d => d.propName === prop);

        if (important) {
          acc[prop] = important.rule.style[prop];
          acc[prop].rule = important.rule;
        }

        if (!Object.prototype.hasOwnProperty.call(acc, prop)) {
          acc[prop] = rule.style[prop];
          acc[prop].rule = rule;
        }
      });
    return acc;
  }, {});

  return computed;
}

