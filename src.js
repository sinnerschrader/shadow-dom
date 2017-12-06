import shortid from 'shortid';

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
  const {shadowRoot} = interrupt(document.createElement('div'), {id, parent: el});

  shadowRoot.id = id;
  shadowRoot.innerHTML = '';

  el.appendChild(shadowRoot);

  return {
    get shadowRoot() {
      return {
        set innerHTML(innerHTML) {
          const doc = parser.parseFromString(innerHTML, 'text/html');
          const styles = [...doc.querySelectorAll('style')];
          const outer = [...document.querySelectorAll('style')]
            .filter(s => styles.indexOf(s) === -1)
            .reduce((rs, s) => {
              Array.prototype.push.apply(rs, s.sheet.cssRules);
              return rs;
            }, []);

          const replacements = styles
            .map(style => {
              return {
                target: style,
                result: style.textContent,
                rules: Array.prototype.slice.call(style.sheet.cssRules, 0)
              };
            })
            .map(r => {
              r.result = scope(r.rules, {id}).join(' ');
              return r;
            })
            /* .map(r => {
              const rules = parseRules(r.result);
              r.result = emphasize(rules, {id, doc, outer});
              return r;
            }); */

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

/* function emphasize(rules, {id, doc, outer}) {
  const overrides = rules.map(rule => {
    const selector = rule.selectorText.replace(`#${id} `, '');
    const els = Array.prototype.slice.call(doc.querySelectorAll(selector), 0);
    const overrides = outer
      .filter(r => els.some(el => matches(el, r.selectorText)))
      .filter(r => {
        const propNames = Array.prototype.slice.call(r.style, 0);
        const importantProps = propNames.filter(propName => r.style.getPropertyPriority(propName));
        return importantProps.some(prop => priop);
      });
  });
} */

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
  return Array.prototype.slice.call(window.getComputedStyle(document.body), 0);
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

function interrupt(el, {parent, id}) {
  const all = supports('all');
  const initial = supports('initial');

  const props = (all && initial) ? ['all'] : getAll();
  const initialFor = getValue();

  const style = document.createElement('style');
  style.setAttribute('data-shadow-dom-id', id);

  style.textContent = `
    #${id} {
      ${props.map(prop => `${prop}: ${initial ? 'initial' : initialFor(prop)}`).join(';\n')}
    }
  `;

  const allRules = Array.prototype.slice.call(document.querySelectorAll('style'), 0)
    .reduce((rules, style) => {
      Array.prototype.push.apply(rules, style.sheet.cssRules);
      return rules;
    }, []);

  const importantRules = flattenRules(allRules)
    .filter((rule) => {
      const propNames = Array.prototype.slice.call(rule.style, 0);
      return propNames.some(propName => rule.style.getPropertyPriority(propName));
    }, []);

  if (importantRules.length > 0) {
    style.textContent += importantRules.map(importantRule => {
      const propNames = Array.prototype.slice.call(importantRule.style, 0);
      return `#${id} ${importantRule.selectorText} {
        ${propNames.map(prop => `${prop}: ${initialFor(prop)}!important;`).join('\n')}
      }`;
    });
  }

  el.classList.add(id);
  parent.insertBefore(style, parent.firstChild);

  return {
    shadowRoot: el
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

function scope(rules, {id}) {
  return rules.map((rule, index) => {
    switch(rule.type) {
      case CSSRule.STYLE_RULE: {
        const selector = [`#${id}`, rule.selectorText].join(' ');
        const body = rule.style.cssText;
        return `${selector} {${body}}`;
      }
      case CSSRule.MEDIA_RULE: {
        const mediaRules = Array.prototype.slice.call(rule.cssRules);
        return `@media ${rule.conditionText} {${scope(mediaRules, {id})}}`;
      }
      default:
        return rule.cssText;
    }
  });
}
