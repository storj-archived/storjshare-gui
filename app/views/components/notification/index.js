/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['notes'],
  created: function() {
    window.document.body.addEventListener('mouseup', eraseNotes.bind(this));
  },
  beforeDestroy: function() {
    window.document.body.removeEventListener('mouseup', eraseNotes.bind(this));
  },
  template: `
<section class="notification" v-if="notes.length > 0" role="alert">
  <a v-on:click.prevent href="#" class="close" aria-label="close">&times;</a>
  <div class="note" v-for="note in notes">
    <span><strong v-if="note.name">{{note.name}}: </strong>{{note.message}}</span>
  </div>
</section>
  `
}

function eraseNotes() {
  this.$emit('erase');
}
