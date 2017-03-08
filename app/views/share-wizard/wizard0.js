'use strict';

module.exports = {
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6 text-left">
        <a href="https://storj.io/share.html"><small>Storj Share</small></a>
      </div>
      <div class="col-6 text-right">
        <small>Setup Wizard</small>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Welcome to Storj Share!</h2>
        <p>Using Storj Share, you can earn StorjCoin X (SJCX) <br class="hidden-sm-down">by renting out your extra hard drive space.</p>
        <router-link :to="{path: '/share-wizard/wizard1'}" class="btn mt-4">Start Setup</router-link>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <small><a href="">Import Config</a></small>
      </div>
    </div>
  </div>
</section>
  `
};
