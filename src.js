import shortid from 'shortid';
import specificity from 'specificity';

const parser = new DOMParser();
const serializer = new XMLSerializer();

const SUPPORTS_SHADOW_DOM = ('attachShadow' in HTMLElement.prototype);

export default shadowDom;

function shadowDom(el) {
  // Paydirt, nothing to do
  if (SUPPORTS_SHADOW_DOM) {
    el.attachShadow({mode: 'open'});
    return el;
  }

  el.innerHTML = '';

  const id = shortid.generate();

  const outer = Array.prototype.slice.call(document.querySelectorAll('style'), 0)
    .reduce((rs, s) => {
      Array.prototype.push.apply(rs, s.sheet.cssRules);
      return rs;
    }, []);

  const selectors = outer.reduce((acc, o) => {
    const s = o.selectorText.split(', ').map(s => s.trim());
    Array.prototype.push.apply(acc, s);
    return acc;
  }, []);

  const highest = getHighestSpecificity(selectors);
  const prefixCount = Math.max(Math.ceil(highest / 100), 1);

  const {shadowRoot, shieldRules} = interrupt(document.createElement('div'), {id, prefixCount, parent: el});

  shadowRoot.setAttribute('id', id);
  shadowRoot.innerHTML = '';

  el.appendChild(shadowRoot);

  return {
    get shadowRoot() {
      return {
        set innerHTML(innerHTML) {
          const doc = parser.parseFromString(innerHTML, 'text/html');

          const styles = Array.prototype.slice.call(doc.querySelectorAll('style'), 0)
            .filter((style) => !style.getAttribute('data-shadow-dom'));

          const inner = flattenRules(styles
            .filter((style) => !style.getAttribute('data-shadow-dom'))
            .reduce((rs, s) => {
              Array.prototype.push.apply(rs, s.sheet.cssRules);
              return rs;
            }, []));

          // TODO: Handle CSSGroupingRule
          const effects = shieldRules
            .map(affectingRule => {
              const prefix = range(prefixCount, `#${id}`).join(' + ');
              const affectingSelector = unprefixSelectors(affectingRule.selectorText, prefix);
              const affectedEls = Array.prototype.slice.call(doc.querySelectorAll(affectingSelector), 0);
              const affectedPropNames = Array.prototype.slice.call(affectingRule.style, 0);

              return {
                affectingRule,
                affectedRules: inner
                  .map(rule => {
                    return {
                      rule,
                      props: affectedPropNames.filter(propName => Boolean(rule.style.getPropertyValue(propName))),
                      els: affectedEls.filter(el => matches(el, rule.selectorText))
                    };
                  })
                  .filter(affected => affected.props.length > 0 && affected.els.length > 0)
              };
            })
            .filter(effect => effect.affectedRules.length > 0);

          const replacements = styles
            .map(style => {
              return {
                target: style,
                result: style.textContent,
                rules: Array.prototype.slice.call(style.sheet.cssRules, 0)
              };
            })
            .map(r => {
              r.result = scope(r.rules, {id, effects, prefixCount}).join(' ');
              return r;
            });

          replacements.forEach(replacement => {
            replacement.target.textContent = replacement.result;
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

function flattenRules(rules) {
  return rules.reduce((acc, r) => {
    switch (r.type) {
      case CSSRule.STYLE_RULE:
        acc.push(r);
        break;
      case CSSRule.MEDIA_RULE:
      case CSSRule.SUPPORTS_RULE:
        Array.prototype.push.apply(acc, flattenRules(Array.prototype.slice.call(r.cssRules, 0)));
        break;
      default:
        return acc;
    }
    return acc;
  }, []);
}

function getAll() {
  // TODO: filter some props as per spec
  return Array.prototype.slice.call(window.getComputedStyle(document.body), 0);
}

function getHighestSpecificity(selectors) {
  if (selectors.length === 0) {
    return 0;
  }

  const spec = specificity.calculate(selectors.sort(specificity.compare)[0])[0].specificityArray;
  return parseInt(spec.join(''), 10);
}

function getCondition(rule, keyword) {
  if ('conditionText' in rule) {
    return rule.conditionText;
  }

  const reg = new RegExp(`@${keyword}\s?([^{]+)\s?`, 'i');
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
  const props = Array.prototype.slice.call(computed, 0);
  const styles = props.reduce((acc, prop) => {
    acc[prop] = computed.getPropertyValue(prop);
    return acc;
  }, {});

  document.body.removeChild(frame);
  return (prop) => styles[prop];
}

function interrupt(el, {parent, prefixCount, id}) {
  const all = supports('all');
  const initial = supports('initial');

  const props = (all && initial) ? ['all'] : getAll();
  const initialFor = getValue();

  const style = document.createElement('style');
  style.setAttribute('data-shadow-dom-initial-id', id);
  style.setAttribute('data-shadow-dom', true);

  const prefix = range(prefixCount, `#${id}`).join(' + ');

  style.textContent = `
    ${prefix} {
      ${props.map(prop => `${prop}: ${initial ? 'initial' : initialFor(prop)}`).join(';\n')}
    }
  `;

  const allRules = Array.prototype.slice.call(document.querySelectorAll('style'), 0)
    .reduce((rules, style) => {
      Array.prototype.push.apply(rules, style.sheet.cssRules);
      return rules;
    }, []);

  // TODO: handle CSSGroupingRules properly
  const importantRules = flattenRules(allRules)
    .filter((rule) => {
      const propNames = Array.prototype.slice.call(rule.style, 0);
      return propNames.some(propName => rule.style.getPropertyPriority(propName));
    }, []);

  const shield = importantRules.length > 0 ? document.createElement('style') : null;

  if (importantRules.length > 0) {
    shield.setAttribute('data-shadow-dom-shield-id', id);
    shield.setAttribute('data-shadow-dom', true);

    // TODO: handle CSSGroupingRules properly
    shield.textContent = importantRules.map(importantRule => {
      const propNames = Array.prototype.slice.call(importantRule.style, 0);
      return `${prefixSelectors(importantRule.selectorText, prefix)} {
        ${propNames.map(prop => `${prop}: ${initialFor(prop)}!important;`).join('\n')}
      }`;
    }).join('\n');

    parent.insertBefore(shield, parent.firstChild);
  }

  parent.insertBefore(style, parent.firstChild);

  for (let i = 0; i < prefixCount; i++) {
    const e = document.createElement('div');
    e.setAttribute('id', id);
    parent.appendChild(e);
  }

  return {
    shadowRoot: el,
    shieldRules: shield === null ? [] : Array.prototype.slice.call(shield.sheet.cssRules, 0)
  };
}

function matches(el, selector) {
  if ('matches' in el) {
    return el.matches(selector);
  }
  if ('msMatchesSelector' in el) {
    return el.msMatchesSelector(selector);
  }
  throw new TypeError('Element.prototype.matches is not supported.');
}

function parseRules(css) {
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);

  const doc = frame.contentDocument;

  const tmp = doc.createElement('style');
  tmp.textContent = css;
  doc.body.appendChild(tmp);

  const rules = Array.prototype.slice.call(tmp.sheet.cssRules, 0);

  document.body.removeChild(frame);
  return rules;
}

function prefixSelectors(selectorText, prefix) {
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

function repeat(string, count) {
  if (typeof String.prototype.repeat === 'function') {
    return string.repeat(count);
  }

  let result = '';
  for (let i = 0; i < count; i++) {
    result += string;
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

  switch(feature) {
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

function scope(...args) {
  const [, context] = args;
  const [rules, {effects, id, prefixCount}] = args;

  return rules.map((rule, index) => {
    switch(rule.type) {
      case CSSRule.STYLE_RULE: {
        // TODO: simplify this, perhaps a facade in front of CSSRule is in order
        const affectedPropNames = effects
          .reduce((acc, effect) => {
            const rs = effect.affectedRules.filter(a => a.rule === rule);
            Array.prototype.push.apply(acc, rs.reduce((a, r) => {
              Array.prototype.push.apply(a, r.props);
              return a;
            }, []));
            return acc;
          }, []);

        const propNames = Array.prototype.slice.call(rule.style, 0);
        const body = propNames.map(propName => {
          const priority = affectedPropNames.indexOf(propName) > -1 ? '!important' : '';
          return `${propName}: ${rule.style.getPropertyValue(propName)}${priority};`;
        }).join('\n');
        const prefixOffset = affectedPropNames.length > 0 ? 1 : 0;

        const prefix = range(prefixCount + prefixOffset, `#${id}`).join(' + ');

        return `${prefixSelectors(rule.selectorText, prefix)} {${body}}`;
      }
      case CSSRule.MEDIA_RULE: {
        const mediaRules = Array.prototype.slice.call(rule.cssRules);
        return `@media ${getCondition(rule, 'media')} {${scope(mediaRules, context)}}`;
      }
      default:
        return rule.cssText;
    }
  });
}

function unprefixSelectors(selectorText, prefix) {
  return selectorText.split(',').map(s => s.replace(prefix, '').trim()).join(' ');
}
