/**
 * @module farmer-gui/helpers
 */

'use strict';

var shell = require('shell');

/**
 * Convenient way for opening links in external browser, not in the app
 * @constructor
 */
function ExternalLinkListener() {
  if (!(this instanceof ExternalLinkListener)) {
    return new ExternalLinkListener();
  }

  this._className = 'js-external-link';
}

/**
 * Handles click events on the given element
 * #_handleClick
 * @param {Object} event
 */
ExternalLinkListener.prototype._handleClick = function(event) {
  var element = event.target;
  var href;
  var isExternal = false;

  if (element.nodeName === 'A') {
    href = element.getAttribute('href');
  }

  if (element.classList.contains(this._className)) {
    isExternal = true;
  }

  if (href && isExternal) {
    shell.openExternal(href);
    event.preventDefault();
  }
};

/**
 * Every link with class this._className will be opened in external browser
 * #bind
 */
ExternalLinkListener.prototype.bind = function() {
  document.addEventListener('click', this._handleClick.bind(this), false);
};

/**
 * Export all helpers
 * #exports
 */
module.exports = {
  ExternalLinkListener: ExternalLinkListener
};
