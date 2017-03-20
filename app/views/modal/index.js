/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['show'],
  template: `
<div class="modal fade" :class="{'show': show}" tabindex="-1">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <slot name="header"/>
      </div>
      <div class="modal-body">
        <slot name="body"/>
      </div>
      <div class="modal-footer">
        <slot name="footer"/>
      </div>
    </div>
  </div>
</div>
  `
}
