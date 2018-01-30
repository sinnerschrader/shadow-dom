import * as queryString from 'query-string';
import {shadowDom} from './shadow-dom';

const PARSER = new DOMParser();
const DEFAULT_DOCUMENT = '<!doctype html><html><head></head><body></body></html>';

export function dom(html) {
  return PARSER.parseFromString(html || DEFAULT_DOCUMENT, 'text/html');
}

export function fixture(name) {
  return require(`../fixtures/${name}.html`);
}

export function bootstrap(name, options = {}) {
  return setup(fixture(name), {name: options.name || name});
}

export function getFontList(element) {
  const fontFamily = window.getComputedStyle(element).getPropertyValue('font-family');
  return fontFamily.split(',').map(f => f.trim());
}

export function getKeyFrames(animationName, ctx) {
  const animation = getAnimation(animationName, ctx);

  if (!animation) {
    return [];
  }

  return Array.prototype.slice.call(animation.cssRules, 0);
}

export function setup(html, options) {
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);

  const el = document.createElement('div');
  if (options && options.name) {
    el.setAttribute('data-test-name', options.name);
  }

  if (html) {
    el.innerHTML = html;
  } else {
    const auto = document.createElement('div');
    auto.classList.add('shadow-dom');
    el.appendChild(auto);
  }


  const shadowElement = el.querySelector('.shadow-dom');

  if (!shadowElement) {
    throw new Error(`setup failed, html provided but no .shadow-dom element found`);
  }

  const cleanup = () => {
    if (queryString.parse(top.location.search).cleanup === 'false') {
      return;
    }

    document.body.removeChild(frame);
  };

  const viewport = {
    set(num) {
      frame.style.width = `${num}px`;
    },
    reset() {
      if (queryString.parse(top.location.search).cleanup === 'false') {
        return;
      }
      frame.style.width = null;
    }
  };

  frame.addEventListener('load', () => {
    // Restore iframe contents on Firefox after load event
    frame.contentDocument.body.appendChild(el);
  });

  frame.contentDocument.body.appendChild(el);

  const innerHTML = shadowElement.innerHTML;
  const scope = shadowDom(shadowElement, {document: frame.contentDocument, forced: true});
  scope.shadowRoot.innerHTML = innerHTML;

  return {
    ctx: el,
    cleanup,
    viewport,
    window: frame.contentWindow,
    document: frame.contentDocument,
    scope
  };
}

function getAnimation(animationName, ctx) {
  const styles = Array.prototype.slice.call(ctx.querySelectorAll('style'), 0);
  const animations = styles
    .reduce((acc, s) => {
      Array.prototype.push.apply(acc, s.sheet.cssRules);
      return acc;
    }, [])
    .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);

  const matches = animations.filter(animation => animation.name === animationName);
  return matches[matches.length - 1];
}
