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
        <small>Finished</small>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>You are amazing!</h2>
        <p>You have successfully configured Storj Share. <br class="hidden-sm-down">Keep on sharing and earning SJCX. #BeTheCloud</p>
        <router-link :to="{path: '/overview'}" class="btn">Finish</router-link>
      </div>
    </div>
  </div>
</section>
  `
};
