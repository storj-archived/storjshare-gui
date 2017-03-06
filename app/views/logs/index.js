/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['shareId', 'closeAction', 'show'],
  template: `
<div class="modal fade" :class="{'show': show}">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Share Log: {{shareId}}</h5>
        <button :click="closeAction" type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <slot>
        </slot>
      </div>
      <div class="modal-footer">
        <button :click="closeAction" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
  `
}
