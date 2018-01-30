import specificity from 'specificity';

import {elementMayMatch} from './element-may-match';
import {flattenRules} from './flatten-rules';
import * as List from './list';
import * as Path from './path';
import {pushTo} from './push-to';
import {splitRule} from './split-rule';
import {toArray} from './to-array';

export function parse(doc, options = {}) {
  const {path = []} = options;

  const styleSheets = getStyleSheets(doc);

  const allRules = List
    .reduce(styleSheets, (acc, sheet) => pushTo(acc, flattenRules(sheet.cssRules)), [])
    .filter(rule => rule.type === CSSRule.STYLE_RULE);

  return List.map(Path.toElement(path, doc).querySelectorAll('*'), node => {
    const rules = allRules
      .filter(rule => elementMayMatch(node, rule.selectorText))
      .reduce((acc, rule) => pushTo(acc, splitRule(rule)), [])
      .filter(rule => elementMayMatch(node, rule.selectorText));

    const important = getImportantDeclarations(rules);

    return {
      tagName: node.tagName,
      path: Path.fromElement(node, doc),
      rules: rules
        .filter(r => !List.some(important, () => r.rule === r))
        .sort((a, b) => specificity.compare(a.selectorText, b.selectorText) * -1),
      important: important.sort((a, b) => bySourcePath(a, b))
    };
  });
}

function getStyleSheets(doc) {
  const result = toArray(document.styleSheets);
  List.forEach(doc.querySelectorAll('style'), tag => result.push(tag.sheet));
  return result;
}

function bySourcePath(a, b) {
  const spd = Path.compare(a.rule.styleSheetPath, b.rule.styleSheetPath) * -1;

  if (spd !== 0) {
    return spd;
  }

  const rpd = Path.compare(a.rule.rulePath, b.rule.rulePath) * -1;
  if (rpd !== 0) {
    return rpd;
  }

  return 0;
}

function getImportantDeclarations(rules) {
  return rules.reduce((acc, rule) => {
    Object.keys(rule.style)
      .filter(propName => rule.style[propName].priority === 'important')
      .forEach(propName => {
        acc.push({
          propName,
          rule
        });
      });
    return acc;
  }, []);
}
