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

  const id = shortid.generate();
  const shadowRoot = interrupt(document.createElement('div'));
  el.innerHTML = '';

  shadowRoot.id = id;
  shadowRoot.innerHTML = '';

  el.appendChild(shadowRoot);

  return {
    get shadowRoot() {
      return {
        set innerHTML(innerHTML) {
          const doc = parser.parseFromString(innerHTML, 'text/html');
          const styles = [...doc.querySelectorAll('style')];

          const replacements = styles
            .map(style => {
              const rules = Array.prototype.slice.call(style.sheet.cssRules, 0);
              return {
                target: style,
                result: scope(id, rules).join(' ')
              };
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

function interrupt(el) {
  const id = shortid();
  const all = supports('all');
  const initial = supports('initial');

  const props = (all && initial) ? ['all'] : getAll();
  const initialFor = getValue();

  const style = document.createElement('style');
  style.setAttribute('data-id', id);

  style.textContent = `
    .${id} {
      ${props.map(prop => `${prop}: ${initial ? 'initial' : initialFor(prop)}`).join(';\n')}
    }
  `;

  el.classList.add(id);
  document.head.appendChild(style);
  return el;
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

function scope(id, rules) {
  return rules.map((rule, index) => {
    switch(rule.type) {
      case CSSRule.STYLE_RULE: {
        const selector = [`#${id}`, rule.selectorText].join(' ');
        const body = rule.style.cssText;
        return `${selector} {${body}}`;
      }
      case CSSRule.MEDIA_RULE: {
        const mediaRules = Array.prototype.slice.call(rule.cssRules);
        return `@media ${rule.conditionText} {${scope(id, mediaRules)}}`;
      }
      default:
        return rule.cssText;
    }
  });
}
