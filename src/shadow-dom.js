import './polyfills';

import postcss from 'postcss';
import safeParser from 'postcss-safe-parser';
import shortid from 'shortid';

import * as initials from './initials';
import {diff} from './diff';
import {elementMayMatch} from './element-may-match';
import {flattenRules} from './flatten-rules';
import {getAll} from './get-all';
import * as List from './list';
import * as Path from './path';
import {pushTo} from './push-to';
import * as styleList from './style-list';
import * as Selector from './selector';
import {splitRule} from './split-rule';
import {specificityMagnitude} from './specificity-magnitude';

export function shadowDom(el, options = {}) {  // eslint-disable-line import/prefer-default-export
  const {
    document = global.document,
    forced = false
  } = options;

  el.innerHTML = '';

  if (forced !== true && 'attachShadow' in HTMLElement.prototype) {
    el.attachShadow({mode: 'open'});
    return el;
  }

  const shadowRoot = createShadowRoot(el, {document});

  return {
    get shadowRoot() {
      return shadowRoot;
    }
  };
}

function createShadowRoot(el, options) {
  const {document} = options;

  const base = document.createElement('div');
  const id = shortid.generate();
  const noop = shortid.generate();

  el.innerHTML = '';

  const shieldEl = document.createElement('style');
  shieldEl.setAttribute('data-shadow-dom-initial', id);
  shieldEl.setAttribute('data-shadow-dom', true);

  const adaptEl = document.createElement('style');
  adaptEl.setAttribute('data-shadow-dom-adapt', id);
  adaptEl.setAttribute('data-shadow-dom', true);

  base.setAttribute('data-shadow-dom-root', id);

  el.appendChild(shieldEl);
  el.appendChild(adaptEl);
  el.appendChild(base);

  const parser = new DOMParser();

  let doc = parser.parseFromString(getDocElement(el).outerHTML, 'text/html');

  const elPath = Path.fromElement(el, document);
  const mountPath = Path.fromElement(base, document);

  const mount = Path.toElement(elPath, doc);
  const mountBase = mount.lastChild;

  const outerRules = List.map(doc.styleSheets, s => s.ownerNode)
    .filter(styleTag => !Path.contains(Path.fromElement(styleTag, doc), mountPath))
    .reduce((acc, tag) => {
      flattenRules(tag.sheet.cssRules)
        .filter(rule => rule.type === CSSRule.STYLE_RULE)
        .forEach(rule => pushTo(acc, splitRule(rule)));
      return acc;
    }, []);

  const spec = (outerRules.length > 0
    ? outerRules.map(o => specificityMagnitude(o.selectorText)).sort((a, b) => a - b)[0]
    : 0) + 1;

  const escalator = `[data-shadow-dom-root="${id}"]${range(spec + 1, `:not(#${noop})`).join('')}`;
  const reEscalator = new RegExp(`^\\[data-shadow-dom-root=["']${id}["']\\]${range(spec + 1, `:not\\(\\#${noop}\\)`).join('')}`);

  shieldEl.textContent = interrupt(el, {id, noop, spec});

  const mark = `/*scope:inside:${id}*/`;

  const observer = new MutationObserver(records => {
    const tasks = [];

    Promise
      .all(records.map(record => {
        const inside = base.contains(record.target) && record.target !== base;

        if (!inside) {
          return Promise.resolve();
        }

        switch (record.type) {
          case 'characterData': {
            // Styling edited inside existing <style> in subtree
            if (record.target.nodeType !== Node.TEXT_NODE || record.target.parentNode.tagName !== 'STYLE') {
              return Promise.resolve();
            }

            return getSelectors(record.target.data)
              .then(selectors => {
                if (List.some(selectors, s => !s.match(reEscalator))) {
                  tasks.push({
                    type: 'scope',
                    scope: 'inside',
                    target: record.target.parentNode
                  });
                }
              });
          }
          case 'childList': {
            // Styling add inside via new <style> in subtree
            List.forEach(record.addedNodes, node => {
              if (node.nodeType !== Node.ELEMENT_NODE || node.textContent.indexOf(mark) > -1) {
                return Promise.resolve();
              }

              if (node.tagName === 'STYLE') {
                tasks.push({
                  type: 'scope',
                  scope: 'inside',
                  target: node
                });
                return;
              }

              List.forEach(node.querySelectorAll('style'), style => {
                tasks.push({
                  type: 'scope',
                  scope: 'inside',
                  target: style
                });
              });
            });

            return Promise.resolve();
          }
          default: {
            return Promise.resolve();
          }
        }
      }))
      .then(() => {
        tasks.forEach(task => {
          if (task.type === 'scope') {
            const sheet = task.target.sheet;

            // The sheet.ownerNode may have been removed from document
            if (sheet) {
              const scoped = List.reduce(sheet.cssRules, (acc, rule) => {
                if (rule.selectorText.match(reEscalator)) {
                  return rule.cssText;
                }
                return `${acc}\n${mark}\n${prefixRule(rule, escalator)}`;
              }, '');

              if (task.target.textContent !== scoped) {
                task.target.textContent = scoped;
              }
            }
          }

          if (task.type === 'adapt') {
            // TODO: Do this incrementally
            doc = parser.parseFromString(getDocElement(el).outerHTML, 'text/html');
            const nodes = styleList.parse(doc, {path: mountPath}).filter(n => Path.contains(n.path, mountPath));

            const visitedRules = [];

            const adaption = nodes.reduce((acc, i) => pushTo(acc, diff(i, {mountPath})), [])
              .reduce((acc, edit) => {
                visitedRules.push(edit.rule);
                acc.push(edit);
                pushTo(acc, findAffectedRules(edit, {doc, escalator, mountPath, nodes, visitedRules}));
                return acc;
              }, [])
              .reduce((text, edit) => {
                text += renderEdit(edit, {noop, doc, id, path: mountPath});
                return text;
              }, '');

            adaptEl.textContent += adaption;
          }
        });
      });
  });

  observer.observe(el, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });

  return {
    appendChild(el) {
      base.appendChild(el);
    },
    set innerHTML(innerHTML) {
      mountBase.innerHTML = innerHTML;

      List.filter(doc.styleSheets, sheet => Path.contains(Path.fromElement(sheet.ownerNode, doc), mountPath))
        .forEach(sheet => {
          sheet.ownerNode.textContent = List.reduce(sheet.cssRules, (acc, rule) => {
            return `${acc}\n${prefixRule(rule, escalator)}`;
          }, '');
        });

      const innerStyleNodes = styleList.parse(doc).filter(n => Path.contains(n.path, mountPath));
      const visitedRules = [];

      const addition = innerStyleNodes.reduce((acc, i) => pushTo(acc, diff(i, {mountPath})), [])
        .reduce((acc, edit) => {
          visitedRules.push(edit.rule);
          acc.push(edit);
          pushTo(acc, findAffectedRules(edit, {doc, escalator, mountPath, nodes: innerStyleNodes, visitedRules}));
          return acc;
        }, [])
        .reduce((text, edit) => {
          text += renderEdit(edit, {noop, doc, id, path: mountPath});
          return text;
        }, '');

      adaptEl.textContent += addition;
      base.innerHTML = mountBase.innerHTML;
    },
    get innerHTML() {
      return base.innerHTML;
    },
    querySelector: base.querySelector.bind(base),
    querySelectorAll: base.querySelectorAll.bind(base),
    toString() {
      return base.toString();
    }
  };
}

function findAffectedRules(edit, ctx) {
  const {doc, escalator, nodes, mountPath, visitedRules} = ctx;

  return nodes
    .filter(node => elementMayMatch(Path.toElement(node.path, doc), edit.selectorText))
    .reduce((acc, node) => {
      node.rules
        .filter(rule => Path.contains(rule.styleSheetPath, mountPath))
        .forEach(rule => {
          const nv = rule.style[edit.prop];

          if (typeof nv === 'undefined') {
            return;
          }

          if (visitedRules.indexOf(rule) > -1) {
            return;
          }

          visitedRules.push(rule);

          acc.push({
            type: 'add',
            prop: edit.prop,
            value: nv.value,
            priority: '!important',
            rule,
            selectorText: rule.selectorText.replace(escalator, ''),
            outerRule: edit.outerRule
          });

          findAffectedRules(rule, ctx);
        });

      return acc;
    }, []);
}

function getSelectors(css) {
  const results = [];

  return postcss([
    css => {
      css.walkRules(rule => {
        if (rule.selector) {
          results.push(rule.selector);
        }
      });
    }
  ])
  .process(css, {from: undefined, parser: safeParser})
  .then(() => results);
}

function renderEdit(edit, {noop, id, doc, path}) {
  const spec = specificityMagnitude(edit.outerRule.selectorText);
  const prefix = `[data-shadow-dom-root="${id}"]${range(spec + 1, `:not(#${noop})`).join('')}`;
  const inside = Selector.inside(edit.selectorText, {doc, path});
  const selector = `${prefix} ${inside}`;
  return wrapWithParents(`${selector} { ${edit.prop}: ${edit.value}${edit.priority}; }`, edit.rule);
}

function prefixRule(rule, prefix) {
  switch (rule.type) {
    case CSSRule.STYLE_RULE:
      return `${prefix} ${rule.selectorText} { ${emitStyle(rule.style)} }`;
    case CSSRule.MEDIA_RULE:
      return `@media ${getGroupingCondition(rule, 'media')} { ${List.map(rule.cssRules, r => prefixRule(r, prefix)).join('\n')} }`;
    case CSSRule.SUPPORTS_RULE:
      return `@supports ${getGroupingCondition(rule, 'supports')} { ${List.map(rule.cssRules, r => prefixRule(r, prefix)).join('\n')} }`;
    default:
      throw new Error(`Unknown type "${rule.type}" in "${JSON.stringify(rule)}"`);
  }
}

function emitStyle(style) {
  return List.map(style, prop => {
    const prio = style.getPropertyPriority(prop) ? '!important' : '';
    return `${prop}: ${style.getPropertyValue(prop)}${prio};`;
  }).join('\n');
}

function interrupt(el, {id, noop, spec}) {
  const all = initials.supports('all');
  const initial = initials.supports('initial');

  const props = (all && initial) ? ['all'] : getAll();
  const escalator = range(spec, `:not(#${noop})`).join('');

  // Edge 15..17 is currently the only browser that
  // does *NOT* support "all" but "initial".
  // Turns out initial is slow to an extent that it froze
  // automated test runs, which does not happen for explicit values
  return `
    [data-shadow-dom-root="${id}"]${escalator} {
      ${props.map(prop => `${prop}: ${initials.get(prop)};`).join('')}
    }

    [data-shadow-dom-root="${id}"]${escalator} ::before {
      ${props.map(prop => `${prop}: ${initials.get(prop)};`).join('')}
    }

    [data-shadow-dom-root="${id}"]${escalator} ::after {
      ${props.map(prop => `${prop}: ${initials.get(prop)};`).join('')}
    }
  `.split('\n').join('');
}

function getDoc(el) {
  while (el.parentNode) {
    el = el.parentNode;
  }
  return el;
}

function getDocElement(el) {
  const doc = getDoc(el);
  return doc.documentElement;
}

function range(count, fill) {
  const result = [];

  for (let i = 0; i < count; i++) {
    if (typeof fill === 'undefined') {
      result.push(i);
    } else {
      result.push(fill);
    }
  }

  return result;
}

function wrapWithParents(content, rule) {
  let result = content;

  while (rule.parentRule) {
    rule = rule.parentRule;
    switch (rule.type) {
      case CSSRule.MEDIA_RULE:
        result = `@media ${getGroupingCondition(rule, 'media')} { ${content} }`;
        break;
      case CSSRule.SUPPORTS_RULE:
        result = `@supports ${getGroupingCondition(rule, 'supports')} { ${content} }`;
        break;
      default:
        break;
    }
  }

  return result;
}

function getGroupingCondition(rule, keyword) {
  if ('conditionText' in rule) {
    return rule.conditionText;
  }

  const reg = new RegExp(`@${keyword}s?([^{]+)s?`, 'i');
  const result = reg.exec(rule.cssText);

  if (result === null) {
    throw new TypeError(`Could not parse conditionText from ${rule.cssText}`);
  }

  return result[1].trim();
}
