module.exports = {
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/share-wizard'}"><small>&lt; Go Back</small></router-link>
      </div>
      <div class="col-6 text-right">
        <small>Step 1 of 3</small>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Step 1 - Payout Address</h2>
        <p>To receive your SJCX earnings, you need a <br class="hidden-sm-down">valid bitcoin address generated in <a href="https://counterwallet.io/" target="_blank">Counterwallet</a>.</p>
      </div>
    </div>
    <div class="row text-center mb-4 mt-3">
      <div class="col-12">
        <input type="text" placeholder="14Je4RQ6cYjytiv4fapajsEar4Gk3L4PAv">
        <router-link :to="{path: '/share-wizard/wizard2'}" class="btn">Next</router-link>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <small><a href="">How to create a wallet?</a> &middot; <a href="">Where do I find the address?</a></small>
      </div>
    </div>
  </div>
</section>
  `
};
