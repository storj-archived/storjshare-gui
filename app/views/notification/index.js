/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['notes', 'dismissAction'],
  created: function() {
    window.document.body.addEventListener('mouseup', this.dismissAction, true);
  },
  beforeDestroy: function() {
    window.document.body.removeEventListener('mouseup', this.dismissAction, true);
  },
  template: `
<section class="notification" v-if="notes.length > 0" role="alert">
  <a v-on:click.prevent href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  <div class="note" v-for="note in notes">
    <span><strong v-if="note.name">{{note.name}}: </strong>{{note.message}}</span>
  </div>
</section>
  `
}
