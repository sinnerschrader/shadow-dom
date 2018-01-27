export function supports(feature) {
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

let FILLED = false;
const SUPPORTS_ALL = supports('all');
const SUPPORTS_INITIAL = supports('initial');
const VALUES = {};

export function get(propName) {
  if (SUPPORTS_ALL && SUPPORTS_INITIAL) {
    return 'initial';
  }

  if (propName === 'all') {
    return 'initial';
  }

  if (FILLED) {
    return VALUES[propName];
  }

  const frame = document.createElement('iframe');
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  const doc = frame.contentDocument;

  const el = doc.createElement('div');
  doc.body.appendChild(el);

  const computed = win.getComputedStyle(el);

  for (let i = 0; i < computed.length; i += 1) {
    VALUES[computed[i]] = computed.getPropertyValue(computed[i]);
  }

  document.body.removeChild(frame);

  FILLED = true;
  return VALUES[propName];
}
