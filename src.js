/**
 */

/**
 * Flag to determinie native shadowDOM support.
 * Called once on a dummy element.
 * @type {boolean}
 */
const HAS_SHADOW_DOM = ('attachShadow' in document.createElement('div'))

/**
 * Ponyfill for attachShadow on `Element`
 * @param {Element} element
 * @param {object} options
 * @returns {Element|false}
 */
const attachShadow = (element, options) => {
  // We might be able to do something with options
  // for now it just exists to replicate the API
  const iframe = document.createElement('iframe')
  iframe.setAttribute('frameBorder', 0)
  element.appendChild(iframe)
  const {contentDocument} = iframe
  if (contentDocument && typeof contentDocument === 'object') {
    const doc = contentDocument.document || contentDocument;
    doc.open()
    doc.close()
    return doc.body
  }
  return false
}

class ShadowDOM {
  /**
   * Construct a ponyfill
   * @param {Element} element
   * @returns {self}
   */
  constructor(element) {
    this.element = element
    this._attachShadow()
  }

  /**
   * Attaches a native shadowDOM or an iframe
   * @private
   */
  _attachShadow() {
    if (HAS_SHADOW_DOM) {
      this.shadowRoot = this.element.attachShadow({mode: 'open'})
    } else {
      this.shadowRoot = attachShadow(this.element, {mode: 'open'})
    }
  }

  /**
   * Ponyfill setter for innerHTML
   * @param {string} innerHTML
   */
  set innerHTML(innerHTML) {
    this.shadowRoot.innerHTML = innerHTML
  }
  /**
   * Ponyfill getter for innerHTML
   * @returns {string}
   */
  get innerHTML() {
    return this.shadowRoot.innerHTML
  }

  /**
   * Ponyfill method for appendChild
   * @param {Element} element
   */
  appendChild(element) {
    this.shadowRoot.appendChild(element)
  }
}

export default ShadowDOM
