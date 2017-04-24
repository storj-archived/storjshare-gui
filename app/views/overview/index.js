module.exports = {
  components: {
    'overview-nav': require('./nav'),
    'overview-footer': require('./footer'),
    'error': require('../components/notification'),
    'overlay': require('../components/overlay')
  },
  name: 'overview',
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
    console.log(this.store.shares)
    this.store.actions.status(() => {
      console.log(this.store.shares)
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
    }
  },

  template: `
<transition name="fade">
  <section>
    <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="store.errors" v-on:erase="store.actions.clearErrors"></error>

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
                <th>Status</th>
                <!-- <th>Balance</th> -->
                <th>Location</th>
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

              <tr v-for="(share, index) in store.shares" :key="share.id" :class="{'node-on': share.isRunning, 'node-off': !share.isRunning}">
                <td colSpan="10" class="overlay" v-if="!share.isValid">
                  <overlay>
                    <img class="loader inline"></img>
                  </overlay>
                </td>
                <td v-if="share.isValid">
                  <input v-model="uiState.selected"
                    v-bind:value="share.id"
                    type="checkbox"
                    class="checkbox">
                </td>

                <td v-if="share.isValid"><b-tooltip :content="share.id"><span>#{{index}}</span></b-tooltip></td>
                <td v-if="share.isValid">
                  <div v-if="share.isRunning"><b-tooltip content="Online"><span class="node-status-on">ON</span></b-tooltip></div>
                  <div v-if="!share.isRunning"><b-tooltip content="Offline"><span class="node-status-off">OFF</span></b-tooltip></div>
                  <!-- <div><b-tooltip content="Please Wait"><span class="node-status-loading">Loading</span></b-tooltip></div> -->
                  <!-- <div><b-tooltip content="Warning Message"><span class="node-status-warning">Warning</span></b-tooltip></div> -->
                  <!-- <div><b-tooltip content="Error Message"><span class="node-status-error">Error</span></b-tooltip></div> -->
                </td>
                <!-- <td class="sjcx">25,920 <span>SJCX</span></td> -->
                <td v-if="share.isValid">{{share.config.storagePath}}</td>
                <td v-if="share.isValid">{{share.meta.uptimeReadable}}</td>
                <td v-if="share.isValid">{{share.meta.numRestarts}}</td>
                <td v-if="share.isValid">{{share.meta.farmerState.totalPeers}}</td>
                <td v-if="share.isValid">{{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}%)</td>
                <td v-if="share.isValid" class="text-right">
                  <b-dropdown :id="'dropdownMenuLink' + share.id">
                    <span slot="text">
                      <img slot="img" src="imgs/icon-settings.svg" alt="Options"></img>
                    </span>
                      <b-dropdown-item v-on:click.prevent="store.actions.start(share.id)" class="dropdown-item" href="#">Start</b-dropdown-item>
                      <b-dropdown-item v-on:click.prevent="store.actions.stop(share.id)" class="dropdown-item" href="#">Stop</b-dropdown-item>
                      <b-dropdown-item v-on:click.prevent="store.actions.start(share.id)" class="dropdown-item" href="#">Restart</b-dropdown-item>
                      <b-dropdown-item v-on:click.prevent="store.actions.logs(share.id)" class="dropdown-item" href="#">Logs</b-dropdown-item>
                      <b-dropdown-item v-on:click.prevent="store.actions.edit(share.id)" class="dropdown-item" href="#">Edit</b-dropdown-item>
                      <!-- <b-dropdown-item v-on:click.prevent="store.actions.advanced(share.id)" class="dropdown-item" href="#">Advanced</b-dropdown-item> -->
                      <b-dropdown-item v-on:click.prevent="store.actions.destroy(share.id)" class="dropdown-item" href="#">Delete</b-dropdown-item>
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
