module.exports = {
  components: {
    'ext-a' : require('../external-anchor')
  },
  template: `
<nav>
  <div class="container">
    <div class="row">
      <div class="col-3 text-left">
        <ext-a href="https://storj.io/share.html"><img src="imgs/logo-horizontal.svg" alt="Storj Share" class="logo-horizontal"></ext-a>
      </div>
      <div class="col-9 text-right">

        <a href="" class="btn btn-secondary mt-3 mr-1">Settings</a>
        <router-link :to="{path: '/share-wizard/wizard1'}" class="btn mt-3">+ Add Drive</router-link>
      </div>
    </div>
  </div>
</nav>
  `
};
