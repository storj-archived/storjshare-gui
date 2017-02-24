/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['errors', 'dismissAction'],
  template: `
<section v-if="errors.length > 0" class="error-stream alert alert-warning alert-dismissible" role="alert">
  <button v-on:click="dismissAction" type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
  <ul>
    <li v-for="error in errors">
      <p><strong v-if="error.name">{{error.name}}: </strong>{{error.message}}</p>
    </li>
  </ul>
</section>
  `
}
