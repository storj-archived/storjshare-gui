module.exports = {
  components: {
    'overview-nav': require('./nav'),
    'overview-footer': require('./footer'),
    'error': require('../notification')
  },

  data: function() {
    return {
      store: window.Store.shareList,
      uiState: {
        selected: []
      }
    }
  },

  computed: {
    listHasItems: function() {
      return this.uiState.selected.length > 0;
    }
  },

  created: function() {
    this.store.actions.status(() => {
      this.store.actions.poll().start();
    });

  },

  destroyed: function() {
    this.store.actions.poll().stop();
  },

  methods: {
    toggleAll: function() {
      if(this.listHasItems) {
        this.uiState.selected = [];
      } else {
        this.store.shares.forEach((share) => {
          this.uiState.selected.push(share.id);
        });
      }
    },
    toggleItem: function(id) {
      let index = this.uiState.selected.indexOf(id);
      if(index >= 0) {
        this.uiState.selected.splice(index, 1);
      } else {
        this.uiState.selected.push(id);
      }
    }
  },

  template: `
<transition name="fade">
  <section>
    <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="store.errors" v-bind:dismiss-action="store.actions.clearErrors"></error>

    <overview-nav></overview-nav>

    <div class="container">
      <div class="row">
        <div class="col">
          <h1 class="mb-4">Overview</h1>
        </div>
      </div>
      <div class="row">
        <div class="col">

          <table class="table">
            <thead>
              <tr>
                <th><input type="checkbox" v-model="listHasItems" v-on:change="toggleAll()" class="checkbox" id="selectAll"></th>
                <th>#</th>
                <th>Location</th>
                <th>Status</th>
                <!-- <th>Balance</th> -->
                <th>Uptime</th>
                <th>Restarts</th>
                <th>Peers</th>
                <th>Shared</th>
                <th class="text-right">
                  <b-dropdown :disabled="this.store.shares.length === 0">
                    <span slot="text">
                      <img src="imgs/icon-settings.svg" alt="Options"/>
                    </span>
                    <a v-on:click.prevent="store.actions.start(uiState.selected)" class="dropdown-item" href="#">Start</a>
                    <a v-on:click.prevent="store.actions.stop(uiState.selected)" class="dropdown-item" href="#">Stop</a>
                    <a v-on:click.prevent="store.actions.start(uiState.selected)" class="dropdown-item" href="#">Restart</a>
                    <!-- <a v-on:click.prevent="store.actions.logs(uiState.selected)" class="dropdown-item" href="#">Logs</a> -->
                    <a v-on:click.prevent="store.actions.destroy(uiState.selected)" class="dropdown-item" href="#">Delete</a>
                  </b-dropdown>
                </th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="(share, index) in store.shares" :key="share.id">
                <td>
                  <input v-model="uiState.selected"
                    v-on:change="toggleItem(share.id)"
                    v-bind:value="share.id"
                    type="checkbox"
                    class="checkbox">
                </td>
                <td>#{{index}}</td>
                <td>{{share.config.storagePath}}</td>
                <td v-if="share.isRunning" class="node-status-on">ON</td>
                <td v-if="!share.isRunning" class="node-status-off">OFF</td>
                <!-- <td class="sjcx">25,920 <span>SJCX</span></td> -->
                <td>{{share.meta.uptimeReadable}}</td>
                <td>{{share.meta.numRestarts}}</td>
                <td>{{share.meta.farmerState.totalPeers}}</td>
                <td>{{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}%)</td>
                <td class="text-right">

                <b-dropdown :id="'dropdownMenuLink' + share.id">
                  <span slot="text">
                    <img slot="img" src="imgs/icon-settings.svg" alt="Options"></img>
                  </span>
                    <a v-on:click.prevent="store.actions.start(share.id)" class="dropdown-item" href="#">Start</a>
                    <a v-on:click.prevent="store.actions.stop(share.id)" class="dropdown-item" href="#">Stop</a>
                    <a v-on:click.prevent="store.actions.start(share.id)" class="dropdown-item" href="#">Restart</a>
                    <a v-on:click.prevent="store.actions.logs(share.id)" class="dropdown-item" href="#">Logs</a>
                    <a v-on:click.prevent="store.actions.edit(share.id)" class="dropdown-item" href="#">Edit</a>
                    <!-- <a v-on:click.prevent="store.actions.advanced(share.id)" class="dropdown-item" href="#">Advanced</a> -->
                    <a v-on:click.prevent="store.actions.destroy(share.id)" class="dropdown-item" href="#">Delete</a>
                </b-dropdown>
                </td>
              </tr>

              <tr v-if="this.store.shares.length === 0">
                <td colSpan="8" class="text-center"><router-link :to="{path: '/share-wizard/wizard1?edit=true'}">Add Drive to Get Started</router-link></td>
              </tr>

            </tbody>
          </table>

        </div>
      </div>
    </div>

    <overview-footer></overview-footer>

  </section>
</transition>
  `
};
