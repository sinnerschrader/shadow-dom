import shortid from 'shortid';

const SUPPORTS_SHADOW_DOM = ('attachShadow' in HTMLElement.prototype);

export default shadowDom;

function shadowDom(el) {
  if (SUPPORTS_SHADOW_DOM) {
    el.attachShadow({mode: 'open'});
    return el;
  }

  const id = shortid.generate();
  const shadowRoot = document.createElement('div');

  el.id = id;
  el.innerHTML = '';
  el.appendChild(shadowRoot);

  return {
    get shadowRoot() {
      return shadowRoot;
    }
  };
}

