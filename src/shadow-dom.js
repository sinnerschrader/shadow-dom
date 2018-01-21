import shortid from 'shortid';
import specificity from 'specificity';

import {diff} from './diff';
import {flattenRules} from './flatten-rules';
import * as List from './list';
import * as Path from './path';
import {parseSelector} from './parse-selector';
import {pushTo} from './push-to';
import * as styleList from './style-list';
import {splitRule} from './split-rule';
import {specificityMagnitude} from './specificity-magnitude';

export function shadowDom(el) {  // eslint-disable-line import/prefer-default-export
  el.innerHTML = '';

  if ('attachShadow' in HTMLElement.prototype) {
    el.attachShadow({mode: 'open'});
    return el;
  }

  const shadowRoot = createShadowRoot(el);

  return {
    get shadowRoot() {
      return shadowRoot;
    }
  };
}

function createShadowRoot(el) {
  const base = document.createElement('div');
  const id = shortid.generate();
  const noop = shortid.generate();
  const initialFor = getValue();

  {
    el.innerHTML = '';
    base.setAttribute('data-shadow-dom-root', id);
    el.appendChild(base);
  }

  return {
    set innerHTML(innerHTML) {
      const parser = new DOMParser();
      const serializer = new XMLSerializer();

      const doc = parser.parseFromString(getDocElement(el).outerHTML, 'text/html');
      const mountPath = Path.fromElement(el, document);

      const mount = Path.toElement(mountPath, doc);
      const mountBase = mount.firstChild;
      mountBase.innerHTML = innerHTML;

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

      interrupt(el, {id, initialFor, noop, spec: spec});
      const shieldEl = el.querySelector(`[data-shadow-dom-initial="${id}"]`);

      const escalator = `[data-shadow-dom-root="${id}"]${range(spec, `:not(#${noop})`).join('')}`;

      List.filter(doc.styleSheets, sheet => Path.contains(Path.fromElement(sheet.ownerNode, doc), mountPath))
        .forEach(sheet => {
          sheet.ownerNode.textContent = List.reduce(sheet.cssRules, (acc, rule) => {
            return `${acc}\n${prefixRule(rule, escalator)}`
          }, '');
        });

      const innerStyleNodes = styleList.parse(doc).filter(n => Path.contains(n.path, mountPath));

      innerStyleNodes.reduce((acc, i) => pushTo(acc, diff(i, mountPath)), [])
        .forEach(edit => {
          const spec = specificityMagnitude(edit.outerRule.selectorText);
          const inside = selectorInside(edit.outerRule.selectorText, {doc, elPath: mountPath});
          const prefix = `[data-shadow-dom-root="${id}"]${range(spec + 1, `:not(#${noop})`).join('')}`;
          shieldEl.textContent += `${prefix} ${inside} { ${edit.prop}: ${edit.value}${edit.priority}; }`;

          // TODO: get all rules that might be affected by this edit (+!important, higher specificity)
          // const affected = getAffected(innerStyleNodes, edit.rule);
        });

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

function prefixRule(rule, prefix) {
  switch (rule.type) {
    case CSSRule.STYLE_RULE:
      return `${prefix} ${rule.selectorText} { ${emitStyle(rule.style)} }`;
    case CSSRule.MEDIA_RULE:
      return `@media ${getGroupingCondition(rule, 'media')} { ${List.map(rule.cssRules, r => prefixRule(r, prefix)).join('\n')} }`;
    case CSSRule.SUPPORTS_RULE:
      return `@supports ${getGroupingCondition(rule, 'supports')} { ${List.map(rule.cssRules, r => prefixRule(r, prefix)).join('\n')} }`;
  }
}

function emitStyle(style) {
  return List.map(style, (prop) => {
    const prio = style.getPropertyPriority(prop) ? '!important' : '';
    return `${prop}: ${style.getPropertyValue(prop)}${prio};`;
  }).join('\n');
}

function isSamePath(a, b) {
  return a.length === b.length && a.every((i, j) => b[j] === i);
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

function interrupt(el, {id, initialFor, noop, spec}) {
  const all = supports('all');
  const initial = supports('initial');

  const props = (all && initial) ? ['all'] : getAll();

  const style = document.createElement('style');
  style.setAttribute('data-shadow-dom-initial', id);
  style.setAttribute('data-shadow-dom', true);

  const escalator = range(spec, `:not(#${noop})`).join('');

  // Edge 15..17 is currently the only browser that
  // does *NOT* support "all" but "initial".
  // Turns out initial is slow to an extent that it froze
  // automated test runs, which does not happen for explicit values
  style.textContent = `
    [data-shadow-dom-root="${id}"]${escalator} {
      ${props.map(prop => `${prop}: ${initialFor(prop)};`).join('\n')}
    }

    [data-shadow-dom-root="${id}"]${escalator} ::before {
      ${props.map(prop => `${prop}: ${initialFor(prop)};`).join('\n')}
    }

    [data-shadow-dom-root="${id}"]${escalator} ::after {
      ${props.map(prop => `${prop}: ${initialFor(prop)};`).join('\n')}
    }
  `;

  el.insertBefore(style, el.firstChild);
}

function getRuleByPath(path, sheet) {
  return path.reduce((rule, index) => {
    if (rule === null) {
      return rule;
    }

    return rule.cssRules[index] || null;
  }, sheet);
}

function getDoc(el) {
  while(el.parentNode) {
    el = el.parentNode;
  }
  return el;
}

function getDocElement(el) {
  const doc = getDoc(el);
  return doc.documentElement;
}

function getValue() {
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);

  const win = frame.contentWindow;
  const doc = frame.contentDocument;

  const el = doc.createElement('div');
  doc.body.appendChild(el);

  const computed = win.getComputedStyle(el);
  const props = Array.prototype.slice.call(computed, 0);
  const styles = props.reduce((acc, prop) => {
    acc[prop] = computed.getPropertyValue(prop);
    return acc;
  }, {});

  document.body.removeChild(frame);
  return prop => {
    if (prop === 'all') {
      return 'initial';
    }
    return styles[prop];
  };
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

function supports(feature) {
  // Use CSS.supports if available
  if ('CSS' in window && 'supports' in CSS) {
    switch (feature) {
      case 'all':
        return CSS.supports('all', 'initial');
      case 'initial':
        return CSS.supports('font-size', 'initial');
      default:
        throw new TypeError(`supports: unknown feature "${feature}".`);
    }
  }

  switch (feature) {
    case 'all': {
      const el = document.createElement('div');
      return 'all' in el.style;
    }
    case 'initial': {
      const frame = document.createElement('iframe');
      document.body.appendChild(frame);

      const doc = frame.contentDocument;
      const win = frame.contentWindow;

      const el = doc.createElement('div');
      doc.body.appendChild(el);

      const before = win.getComputedStyle(el).getPropertyValue('color');

      doc.body.style.color = 'rgb(255, 0, 0)';
      const inter = win.getComputedStyle(el).getPropertyValue('color');

      el.style.color = 'initial';
      const after = win.getComputedStyle(el).getPropertyValue('color');

      const supported = before !== inter && after !== inter && before === after;
      document.body.removeChild(frame);
      return supported;
    }
    default:
      throw new TypeError(`supports: unknown feature "${feature}".`);
  }
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

function selectorInside(selector, {doc, elPath}) {
  const selectors = parseSelector(selector)
    .reverse()
    .filter(node => node.type !== 'pseudo')
    .map((node, index, nodes) => nodes.slice(index).reverse().map(n => String(n)).join(''))
    .filter(selector => {
      const trimmed = selector.trim();
      const last = trimmed[trimmed.length - 1];
      return last !== '~' && last !== '+' && last !== '>';
    });

  const index = selectors.findIndex(s => !containsMatching(s, {doc, elPath}));
  const nonMatch = selectors[index];

  const regex = new RegExp(`^${nonMatch}`);
  const result = selector.replace(regex, '');

  if (!result) {
    return selector;
  }

  return result;
}

function selectorOutside(selector, {doc, elPath}) {
  const inside = selectorInside(selector, {doc, elPath});
  const head = selector.substring(0, selector.indexOf(inside));
  return head;
}

function containsMatching(selector, {doc, elPath}) {
  return List.some(doc.querySelectorAll(selector), e => Path.contains(Path.fromElement(e, doc), elPath));
}
