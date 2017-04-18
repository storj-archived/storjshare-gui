module.exports = {
  components: {
    'ext-a' : require('../components/external-anchor'),
    'uploader': require('../uploader')
  },
  data: function() {
    return window.Store.shareList;
  },
  methods: {
    importShares: function(event) {
      Array.prototype.forEach.call(event.target.files, (file) => {
        this.actions.import(file.path, () => {
          if(this.errors.length === 0) {
            return this.$router.push({ path: '/overview' });
          }
        });
      });
    }
  },
  template: `
<nav>
  <div class="container">
    <div class="row">
      <div class="col-3 text-left">
        <ext-a href="https://storj.io/share.html"><img src="imgs/logo-horizontal.svg" alt="Storj Share" class="logo-horizontal"></ext-a>
      </div>
      <div class="col-9 text-right">

        <!-- <a href="" class="btn btn-secondary mt-3 mr-1">Settings</a> -->
        <uploader v-bind:select-action="importShares"></uploader>
        <router-link :to="{path: '/share-wizard/wizard1?edit=true'}" class="btn mt-3">+ Add Drive</router-link>
      </div>
    </div>
  </div>
</nav>
  `
};
