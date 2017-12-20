import {shadowDom} from './shadow-dom';

export function fixture(name) {
  return require(`../fixtures/${name}.html`);
}

export function bootstrap(name) {
  return setup(fixture(name), {name});
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

  document.body.appendChild(el);

  const shadowElement = el.querySelector('.shadow-dom');

  if (!shadowElement) {
    throw new Error(`setup failed, html provided but no .shadow-dom element found`);
  }

  const cleanup = () => {
    document.body.removeChild(el);
  }

  const innerHTML = shadowElement.innerHTML;
  const scope = shadowDom(shadowElement);
  scope.shadowRoot.innerHTML = innerHTML;

  return {
    cleanup,
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
