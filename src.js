import selectorParser from 'postcss-selector-parser';
import shortid from 'shortid';
import specificity from 'specificity';

export function shadowDom(el) { // eslint-disable-line import/prefer-default-export
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  if ('attachShadow' in HTMLElement.prototype) {
    el.attachShadow({mode: 'open'});
    return el;
  }

  el.innerHTML = '';

  const id = shortid.generate();
  const noop = shortid.generate();
  const initialFor = getValue();

  const initialOuterRules = flattenRules(
    toArray(document.querySelectorAll('style'), 0).reduce((rs, s) => pushTo(rs, s.sheet.cssRules), [])
  );

  const prefixCount = Math.max(Math.ceil(getHighestSpecificity(getSelectors(initialOuterRules)) / 100), 1);

  const {shadowRoot} = interrupt(document.createElement('div'), {id, initialFor, noop, prefixCount, parent: el});
  shadowRoot.setAttribute('data-shadow-dom-root', id);
  shadowRoot.innerHTML = '';

  el.appendChild(shadowRoot);

  return {
    get shadowRoot() {
      return {
        set innerHTML(innerHTML) {
          const doc = parser.parseFromString(innerHTML, 'text/html');
          const outerDoc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');

          const outerRules = toArray(outerDoc.querySelectorAll('style'), 0).reduce((rs, s) => pushTo(rs, s.sheet.cssRules), []);
          const outerAnimations = outerRules.filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);
          const outerFonts = outerRules.filter(rule => rule.type === CSSRule.FONT_FACE_RULE);
          const flattenOuterRules = flattenRules(outerRules);
          const innerRules = toArray(doc.querySelectorAll('style'), 0).reduce((rs, s) => pushTo(rs, s.sheet.cssRules), []);
          const prefix = `[data-shadow-dom-root="${id}"]:not(#${noop})`;

          const mount = getElementByPath(getPathByElement(el), outerDoc);
          mount.innerHTML = innerHTML;

          const shielding = flattenOuterRules
            .reduce((acc, r) => {
              r.selectorText.split(',')
                .map(s => s.trim())
                .forEach(s => {
                  acc.push({
                    parentNode: r.parentNode,
                    selectorText: s,
                    style: r.style
                  });
                });
              return acc;
            }, [])
            .map(rule => {
              const affectedElements = toArray(outerDoc.querySelectorAll(rule.selectorText), 0).filter(el => mount.contains(el));
              return {
                affectedElements,
                rule
              };
            })
            .filter(({affectedElements}) => affectedElements.length > 0)
            .map(({rule, affectedElements}) => {
              const insideSelector = selectorInside(rule.selectorText, {el: mount, doc: outerDoc});
              const outsideSelector = selectorOutside(rule.selectorText, {el: mount, doc: outerDoc});
              const selector = `${outsideSelector} ${prefix} ${insideSelector}`;
              const [calc] = specificity.calculate(selector);

              return {
                affectedElements,
                rule,
                selector,
                specificity: calc.specificityArray
              };
            });

          const shieldCss = shielding.map(({rule, selector}) => {
            const propNames = toArray(rule.style, 0);
            const content = `
              ${selector} {
                ${propNames.map(prop => {
                  const priority = rule.style.getPropertyPriority(prop) === 'important' ? '!important' : '';
                  return `${prop}: ${initialFor(prop)}${priority};`;
                }).join('\n')}
            }`;
            return wrapWithParents(content, rule);
          }).join('\n');

          const styles = toArray(doc.querySelectorAll('style'), 0);
          const mostSpecificShield = shielding.sort((a, b) => specificity.compare(a.specificity, b.specificity))[0];
          const factor = mostSpecificShield ? Math.max(Math.ceil(parseInt(mostSpecificShield.specificity.join(''), 10) / 100), 1) : 1;
          const innerPrefix = `[data-shadow-dom-root="${id}"]${range(factor, `:not(#${noop})`).join('')}`;

          const animationResolutions = innerRules
            .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE)
            .filter(rule => some(outerAnimations, r => r.name === rule.name))
            .map(rule => ({
              nameBefore: rule.name,
              name: shortid.generate(),
              rule
            }));

          const fontResolutions = innerRules
            .filter(rule => rule.type === CSSRule.FONT_FACE_RULE)
            .filter(rule => some(outerFonts, r => r.style.getPropertyValue('font-family') === rule.style.getPropertyValue('font-family')))
            .map(rule => ({
              nameBefore: rule.style.getPropertyValue('font-family'),
              name: shortid.generate(),
              rule
            }));

          const tasks = styles.map(style => {
            const rawRules = toArray(style.sheet.cssRules, 0);

            const rules = rawRules.reduce((acc, rule) => {
              if (rule.type === CSSRule.STYLE_RULE) {
                rule.selectorText.split(',').map(s => s.trim()).forEach(selector => {
                  acc.push({
                    cssText: rule.cssText,
                    type: rule.type,
                    parentRule: rule.parentRule,
                    selectorText: selector,
                    style: rule.style
                  });
                });
              } else {
                acc.push(rule);
              }
              return acc;
            }, []);

            const replacements = rules.map(rule => {
              const selector = getFlatSelector(rule);

              const matchedElements = selector ?
                toArray(outerDoc.querySelectorAll(selector)).filter(node => mount.contains(node)) :
                [];

              // TODO Extract important props from this
              const importantPropNames = shielding
                .filter(s => some(s.affectedElements, a => some(matchedElements, m => a === m)))
                .reduce((acc, {rule: {style}}) => {
                  const isImportant = propName => style.getPropertyPriority(propName) === 'important';
                  return pushTo(acc, toArray(style).filter(isImportant));
                }, []);

              return scopeRule(rule, {
                animationResolutions,
                fontResolutions,
                id,
                importantPropNames,
                noop,
                prefix: innerPrefix
              });
            });

            return {
              style,
              textContent: replacements.join('')
            };
          });

          const shield = document.createElement('style');
          shield.textContent = shieldCss;
          el.appendChild(shield);

          tasks.forEach(({style, textContent}) => {
            style.textContent = textContent;
          });

          shadowRoot.innerHTML = serializer.serializeToString(doc);
        },
        get innerHTML() {
          return shadowRoot.innerHTML;
        },
        querySelector(...args) {
          return shadowRoot.querySelector(...args);
        },
        toString() {
          return shadowRoot.toString();
        }
      };
    }
  };
}

function getFlatSelector(rule) {
  switch (rule.type) {
    case CSSRule.MEDIA_RULE:
      return toArray(rule.cssRules).map(getFlatSelector).join(',');
    case CSSRule.STYLE_RULE:
      return rule.selectorText;
    case CSSRule.SUPPORTS_RULE: {
      return toArray(rule.cssRules).map(getFlatSelector).join(',');
    }
    default:
      return '';
  }
}

function getResolvedValue(style, propName, {animationResolutions, fontResolutions}) {
  const value = style.getPropertyValue(propName);

  switch (propName) {
    case 'animation-name': {
      const keyframes = find(animationResolutions, res => res.nameBefore === value);
      return keyframes.name || value;
    }
    case 'font-family': {
      const fontList = value.split(',').map(f => f.trim()).filter(Boolean);
      const face = find(fontResolutions, r => some(fontList, f => r.nameBefore.replace(/("|')/g, '') === f));

      return face ?
        fontList.map(f => f === face.nameBefore.replace(/("|')/g, '') ? face.name : f) :
        value;
    }
    default:
      return value;
  }
}

function scopeFontFaceRule(rule, {fontResolutions}) {
  const face = find(fontResolutions, res => res.nameBefore === rule.style.getPropertyValue('font-family')) || rule;
  const propNames = toArray(rule.style);

  const body = propNames.map(propName => {
    if (face && face.name && propName === 'font-family') {
      return `${propName}: ${face.name};`;
    }
    return `${propName}: ${rule.style.getPropertyValue(propName)};`;
  }).join('\n');

  return `@font-face {${body}}`;
}

function scopeGroupingRule(rule, keyword, ctx) {
  const rules = toArray(rule.cssRules);
  const body = rules.map(r => scopeRule(r, ctx));
  return `@${keyword} ${getGroupingCondition(rule, keyword)} {${body}}`;
}

function scopeKeyframeRule(rule, {animationResolutions}) {
  const keyframes = find(animationResolutions, res => res.nameBefore === rule.name) || rule;
  return `@keyframes ${keyframes.name} {${toArray(rule.cssRules).map(rule => rule.cssText).join('\n')}}`;
}

function scopeRule(rule, ctx) {
  switch (rule.type) {
    case CSSRule.FONT_FACE_RULE:
      return scopeFontFaceRule(rule, ctx);
    case CSSRule.KEYFRAMES_RULE:
      return scopeKeyframeRule(rule, ctx);
    case CSSRule.MEDIA_RULE:
      return scopeGroupingRule(rule, 'media', ctx);
    case CSSRule.STYLE_RULE:
      return scopeStyleRule(rule, ctx);
    case CSSRule.SUPPORTS_RULE: {
      return scopeGroupingRule(rule, 'supports', ctx);
    }
    default:
      return rule.cssText;
  }
}

function scopeStyleRule(rule, {animationResolutions, fontResolutions, importantPropNames, prefix}) {
  const propNames = toArray(rule.style);

  const body = propNames.map(propName => {
    const propValue = getResolvedValue(rule.style, propName, {animationResolutions, fontResolutions});

    const propPriority = includes(importantPropNames, propName) ?
      '!important' :
      rule.style.getPropertyPriority(propName) === 'important' ? '!important' : '';

    return `${propName}: ${propValue}${propPriority};`;
  });

  return `${prefixSelectors(rule.selectorText, prefix)} {${body.join('')}}`;
}

function selectorInside(selector, {doc, el}) {
  const selectors = parseSelector(selector).map((node, index, nodes) => nodes.slice(index).reverse().map(n => String(n)).join(''));
  const index = selectors.findIndex(s => !containsMatching(s, {doc, el}));
  const nonMatch = selectors[index];

  const regex = new RegExp(`^${nonMatch}`);
  const result = selector.replace(regex, '');

  if (!result) {
    return selector;
  }

  return result;
}

function parseSelector(selector) {
  const result = [];

  const transform = selectors => {
    selectors.last.nodes.forEach(node => {
      result.push(node);
    });
  };

  selectorParser(transform).processSync(selector);
  return result.reverse();
}

function selectorOutside(selector, {doc, el}) {
  const inside = selectorInside(selector, {doc, el});
  const head = selector.substring(0, selector.indexOf(inside));
  return head;
}

function containsMatching(selector, {doc, el}) {
  return some(toArray(doc.querySelectorAll(selector), 0), e => el.contains(e));
}

function popSelector(selector) {
  let tail = '';

  const transform = selectors => {
    selectors.nodes.forEach(selector => {
      tail = String(selector.last);
      selector.last.remove();
    });
  };

  const head = selectorParser(transform).processSync(selector);
  return [head, tail];
}

function find(arr, predicate) {
  if (Array.prototype.find) {
    return arr.find(predicate);
  }

  const list = Object(arr);
  const length = list.length >>> 0;

  let value;

  for (let i = 0; i < length; i++) {
    value = list[i];
    if (predicate(value, i, list)) {
      return value;
    }
  }
  return undefined;
}

function flattenRules(rules) {
  return rules.reduce((acc, r) => {
    switch (r.type) {
      case CSSRule.STYLE_RULE:
        acc.push(r);
        break;
      case CSSRule.MEDIA_RULE:
      case CSSRule.SUPPORTS_RULE:
        pushTo(acc, flattenRules(toArray(r.cssRules, 0)));
        break;
      default:
        return acc;
    }
    return acc;
  }, []);
}

function getAll() {
  // TODO: filter some props as per spec
  return toArray(window.getComputedStyle(document.body), 0);
}

function getPathByElement(element, base) {
  const selector = [];
  let current = element;

  while (current.parentNode && base ? current !== base : current.tagName.toLowerCase() !== 'body') {
    const count = getElementIndex(current);
    selector.unshift(count);
    current = current.parentNode;
  }

  return selector;
}

function getElementByPath(elementPath, doc) {
  return elementPath.reduce((el, index) => {
    const childElements = toArray(el.childNodes, 0)
      .filter(n => n.nodeType === Node.ELEMENT_NODE);
    return childElements[index];
  }, doc.body);
}

function getElementIndex(element) {
  let index = 0;

  while ((element = element.previousElementSibling)) {
    index++;
  }

  return index;
}

function getHighestSpecificity(selectors) {
  if (selectors.length === 0) {
    return 0;
  }

  const spec = specificity.calculate(selectors.sort(specificity.compare)[0])[0].specificityArray;
  return parseInt(spec.join(''), 10);
}

function getSelectors(rules) {
  return rules
    .filter(r => typeof r.selectorText === 'string')
    .reduce((acc, o) => pushTo(acc, o.selectorText.split(', ').map(s => s.trim())), []);
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

function getValue() {
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);

  const win = frame.contentWindow;
  const doc = frame.contentDocument;

  const el = doc.createElement('div');
  doc.body.appendChild(el);

  const computed = win.getComputedStyle(el);
  const props = toArray(computed, 0);
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

function interrupt(el, {parent, prefixCount, noop, id, initialFor}) {
  const all = supports('all');
  const initial = supports('initial');

  const props = (all && initial) ? ['all'] : getAll();

  const style = document.createElement('style');
  style.setAttribute('data-shadow-dom-initial-id', id);
  style.setAttribute('data-shadow-dom', true);

  const prefix = `[data-shadow-dom-root="${id}"]${range(prefixCount, `:not(#${noop})`).join('')}`;

  // Edge 15..17 is currently the only browser that
  // does *NOT* support "all" but "initial".
  // Turns out initial is slow to an extent that it froze
  // automated test runs, which does not happen for explicit values
  style.textContent = `
    ${prefix} {
      ${props.map(prop => `${prop}: ${initialFor(prop)}`).join(';\n')}
    }
  `;

  parent.insertBefore(style, parent.firstChild);

  return {
    shadowRoot: el,
    shieldRules: []
  };
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

function prefixSelectors(selectorText, prefix = '') {
  return selectorText.split(',').map(s => `${prefix} ${s.trim()}`).join(', ');
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

function includes(arr, search) {
  if (Array.prototype.includes) {
    return arr.includes(search);
  }

  return arr.indexOf(search) > -1;
}

function some(arr, predicate) {
  if (Array.prototype.some) {
    return arr.some(predicate);
  }

  if (arr === null) {
    throw new TypeError('Array.prototype.some called on null or undefined');
  }

  if (typeof predicate !== 'function') {
    throw new TypeError();
  }

  const t = Object(arr);
  const len = t.length >>> 0;

  for (let i = 0; i < len; i++) {
    if (i in t && predicate(t[i], i, t)) {
      return true;
    }
  }

  return false;
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

function toArray(input) {
  return Array.prototype.slice.call(input, 0);
}

function pushTo(to, from) {
  Array.prototype.push.apply(to, from);
  return to;
}
