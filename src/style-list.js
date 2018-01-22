import specificity from 'specificity';

import {elementMayMatch} from './element-may-match';
import {flattenRules} from './flatten-rules';
import * as List from './list';
import * as Path from './path';
import {parseSelector} from './parse-selector';
import {pushTo} from './push-to';
import {splitRule} from './split-rule';

const DEFAULT_DOC = '<html><head></head><body></body></html>';

export function parse(doc) {
  const allRules = List
    .reduce(doc.getElementsByTagName('style'), (acc, style) => pushTo(acc, flattenRules(style.sheet.cssRules)), [])
    .filter(rule => rule.type === CSSRule.STYLE_RULE)
    .reduce((acc, rule) => pushTo(acc, splitRule(rule)), [])
    .sort((a, b) => specificity.compare(a.selectorText, b.selectorText) * -1);

  return List.map(doc.querySelectorAll('*'), (node) => {
    const rules = allRules.filter(rule => elementMayMatch(node, rule.selectorText));
    const important = getImportantDeclarations(rules);

    return {
      tagName: node.tagName,
      path: Path.fromElement(node, doc),
      rules: rules.filter(r => !important.some(i => r.rule === r)),
      important: important.sort((a, b) => {
        const spd = Path.compare(a.rule.styleSheetPath, b.rule.styleSheetPath) * -1;
        if (spd !== 0) {
          return spd;
        }

        const rpd = Path.compare(a.rule.rulePath, b.rule.rulePath) * -1;
        if (rpd !== 0) {
          return rpd;
        }

        return 0;
      })
    };
  });
}

function getImportantDeclarations(rules) {
  return rules.reduce((acc, rule) => {
    Object.keys(rule.style)
      .filter(propName => rule.style[propName].priority === 'important')
      .map(propName => {
        acc.push({
          propName: propName,
          rule
        });
      });
    return acc;
  }, [])
}
