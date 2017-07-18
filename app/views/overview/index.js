const isTestnet = process.env.isTestNet;

module.exports = {
  components: {
    'overview-nav': require('./nav'),
    'overview-footer': require('./footer'),
    'error': require('../components/notification')
  },
  name: 'overview',
  data: function() {
    return {
      store: window.Store.shareList,
      uiState: {
        selected: []
      },
      appState: {
        isTestnet: isTestnet
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
    }
  },

  template: `
<transition name="fade">
  <section>
    <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="store.errors" v-on:erase="store.actions.clearErrors"></error>
    <div v-if="appState.isTestnet">
      <b-tooltip content="Install or Build the Application to Farm on the Production Storj network.">
        <span style="position: fixed; bottom:0px; left:0px">Currently Running Storj on Test Network...</span>
      </b-tooltip content>
    </div>
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
                <th>Offers</th>
                <th>Shared</th>
                <th>Delta</th>
                <th>Port</th>
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
                <td>
                  <input v-model="uiState.selected"
                    v-bind:value="share.id"
                    type="checkbox"
                    class="checkbox">
                </td>

                <td><b-tooltip :content="share.id"><span>#{{index}}</span></b-tooltip></td>
                <td>
                  <div v-if="share.isValid && share.isRunning"><b-tooltip content="Online"><span class="node-status-on">ON</span></b-tooltip></div>
                  <div v-if="share.isValid && !share.isRunning"><b-tooltip content="Offline"><span class="node-status-off">OFF</span></b-tooltip></div>
                  <div v-if="!share.isValid"><b-tooltip content="Please Wait"><span class="node-status-loading">Loading</span></b-tooltip></div>
                  <!-- <div><b-tooltip content="Warning Message"><span class="node-status-warning">Warning</span></b-tooltip></div> -->
                  <!-- <div><b-tooltip content="Error Message"><span class="node-status-error">Error</span></b-tooltip></div> -->
                </td>
                <!-- <td class="storj">25,920 <span>STORJ</span></td> -->
                <td>{{share.config.storagePath}}</td>
                <td><span v-if="share.isRunning">{{share.meta.uptimeReadable}}</span></td>
                <td>{{share.meta.numRestarts}}</td>
                <td>{{share.meta.farmerState.totalPeers}}</td>
                <td>{{share.meta.farmerState.contractCount}} ({{share.meta.farmerState.dataReceivedCount !== 0 ? Math.ceil(share.meta.farmerState.dataReceivedCount / share.meta.farmerState.contractCount * 100) : 0}}% received)</td>
                <td>{{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}%)</td>
                <td v-if="share.meta.farmerState.ntpStatus && share.meta.farmerState.ntpStatus.status === 2">
                  <b-tooltip content="Your computer clock is out of sync. Consider installing a sync tool such as NetTime">
                    <span class="connection" v-if="share.meta.farmerState.ntpStatus && share.isRunning" v-bind:status="share.meta.farmerState.ntpStatus.status">{{share.meta.farmerState.ntpStatus.delta}}</span>
                  </b-tooltip>
                </td>
                <td v-else>
                  <span class="connection" v-if="share.meta.farmerState.ntpStatus && share.isRunning" v-bind:status="share.meta.farmerState.ntpStatus.status">{{share.meta.farmerState.ntpStatus.delta}}</span>
                </td>
                <td><span class="connection" v-if="share.meta.farmerState.portStatus && share.isRunning" v-bind:status="share.meta.farmerState.portStatus.connectionStatus">{{share.meta.farmerState.portStatus.listenPort}} {{share.meta.farmerState.portStatus.connectionType}}</span></td>
                <td class="text-right">
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
