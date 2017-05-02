'use strict';

const {dialog} = require('electron');

class FatalExceptionDialog {

  /**
   * Builds fatal dialog on error for application restart.
   * Will not display until render() is called.
   * @constructor
   */
  constructor(appRoot, appRootWindow, errObj) {
    this.app = appRoot;
    this.window = appRootWindow;
    this.err = errObj;
  }

  /**
   * Builds and renders the dialog
   */
  render() {
    dialog.showMessageBox(
      this.window,
      {
        title: "Fatal Exception",
        type: 'error',
        buttons: ['Quit'],
        detail: this.err.message,
        checkboxLabel: 'Attempt to Restart',
        checkboxChecked: true
      },
      this._handleClose.bind(this)
    );
  }

  /**
   * handles closing and restarting of the application
   */
  _handleClose(resp, isRestartChecked) {
    if(isRestartChecked) {
      this.app.relaunch();
    }

    this.app.exit(0);
  }
}

module.exports = FatalExceptionDialog;
