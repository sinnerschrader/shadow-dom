import * as List from './list';
import * as Path from './path';

export function splitRule(rule) {
  return rule.selectorText.split(',')
    .map(selectorText => createRule(rule, {selectorText}));
}

function createRule(cssRule, overrides) {
  const node = cssRule.parentStyleSheet.ownerNode;
  const doc = node.ownerDocument;

  return {
    cssText: cssRule.cssText,
    style: styleToMap(cssRule.style),
    selectorText: (overrides.selectorText || cssRule.selectorText).trim(),
    type: cssRule.type,
    parentRule: cssRule.parentRule, // TODO: Do not expose entire parentRules, simplify too
    styleSheetPath: Path.fromElement(node, doc),
    rulePath: getPathByRule(cssRule, node.sheet)
  };
}

function getPathByRule(cssRule) {
  let current = cssRule;

  const path = [];

  while (current.parentRule || current.parentStyleSheet) {
    path.unshift(getRuleIndex(current));
    current = (current.parentRule || current.parentStyleSheet);
  }

  return path;
}

function getRuleIndex(rule) {
  const p = rule.parentRule || rule.parentStyleSheet;

  for (let i = 0; i < p.cssRules.length; i++) {
    if (p.cssRules[i] === rule) {
      return i;
    }
  }

  return -1;
}

function styleToMap(style) {
  return List.reduce(style, (acc, name) => {
    acc[name] = {
      value: style.getPropertyValue(name),
      priority: style.getPropertyPriority(name),
    };
    return acc;
  }, {});
}
