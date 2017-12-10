const isTestnet = process.env.isTestNet === 'true';

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
      <span v-b-tooltip title="Install or Build the Application to Farm on the Production Storj network." style="position: fixed; bottom:0px; left:0px">Currently Running Storj on Test Network...</span>
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
		<th>NodeID</th>
                <th>Status</th>
                <!-- <th>Balance</th> -->
                <th>Location</th>
                <th>Uptime</th>
                <th>Restarts</th>
                <th>Peers</th>
                <th>Bridges</th>
                <th>Allocs</th>
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

                <td><span>{{index}}</span></td>

		<td><span v-b-tooltip title="The NodeID is the unique Storj identity of the node.">{{share.id}}</span></td>

                <td>
                  <div v-if="share.isValid && share.isRunning"><span v-b-tooltip title="Online" class="node-status-on">ON</span></div>
                  <div v-if="share.isValid && !share.isRunning"><span v-b-tooltip title="Offline" class="node-status-off">OFF</span></div>
                  <div v-if="!share.isValid"><span v-b-tooltip title="Please Wait" class="node-status-loading">Loading</span></div>
                  <!-- <div><span v-b-tooltip title="Warning Message" class="node-status-warning">Warning</span></div> -->
                  <!-- <div><span v-b-tooltip title="Error Message" class="node-status-error">Error</span></div> -->
                </td>
                <!-- <td class="storj">25,920 <span>STORJ</span></td> -->
                <td>{{share.config.storagePath}}</td>
                <td><span v-if="share.isRunning">{{share.meta.uptimeReadable}}</span></td>
                <td><span v-b-tooltip title="A node will often restart when you receive an error. Search the log for ECONNRESET if this happens frequently.">{{share.meta.numRestarts}}</span></td>
                <td><span v-b-tooltip title="Used for legacy compatibility.">{{share.meta.farmerState.totalPeers}}</span></td>
                <td>
                  <div v-if="!share.isValid || (share.isValid && !share.isRunning) || share.meta.farmerState.bridgesConnectionStatus === 0"><span v-b-tooltip title="Not connected to any bridges" class="node-status-off">Disconnected</span></div>
                  <div v-if="share.isValid && share.isRunning && share.meta.farmerState.bridgesConnectionStatus === 1"><span v-b-tooltip title="Connecting to bridges" class="node-status-loading">Connecting</span></div>
                  <div v-if="share.isValid && share.isRunning && share.meta.farmerState.bridgesConnectionStatus === 2"><span v-b-tooltip title="Performing Proof of Work to join the network" class="node-status-loading">Confirming</span></div>
                  <div v-if="share.isValid && share.isRunning && share.meta.farmerState.bridgesConnectionStatus === 3"><span v-b-tooltip title="Connected to bridges" class="node-status-on">Connected</span></div>
                </td>
                <td><span v-b-tooltip title="How many times since you reset your node that the Bridge has asked your node for an alloc message. An alloc is basically telling the Bridge your node's status.">{{share.meta.farmerState.contractCount}}</span><span v-b-tooltip title="This is a count of how many shards you have received."> ({{share.meta.farmerState.dataReceivedCount}} received)</span></td>
                <td><span v-b-tooltip title="This shows how much space is being used by shards and the percentage of total space that is being used. If this says ... either your node is new and doesn't yet have any data, or there is potentially a corruption issue.">{{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}%)</span></td>
                <td v-if="share.meta.farmerState.ntpStatus && share.meta.farmerState.ntpStatus.status === 2">
                   <span class="connection" v-if="share.meta.farmerState.ntpStatus && share.isRunning" v-bind:status="share.meta.farmerState.ntpStatus.status" v-b-tooltip title="Your clock's precision is out of sync. If it is 9999 this may indicate a one time NTP communication failure which can be ignored unless it happens for hours at a time.">{{share.meta.farmerState.ntpStatus.delta}}</span>
                </td>
                <td v-else>
                  <span class="connection" v-if="share.meta.farmerState.ntpStatus && share.isRunning" v-bind:status="share.meta.farmerState.ntpStatus.status" v-b-tooltip title="This is your clock's precision.">{{share.meta.farmerState.ntpStatus.delta}}</span>
                </td>
                <td><span v-b-tooltip.html.left title="The port your node is listening on. Each node should be on a different port. Port status should be green. If your port status says UPnP, Tunneling, or is Red you should manually setup port forwarding. If your node status is black, you may need to configure port forwarding manually or you may have a loopback error. Please visit https://community.storj.io and join the channel #storjshare for further help." class="connection" v-if="share.meta.farmerState.portStatus && share.isRunning" v-bind:status="share.meta.farmerState.portStatus.connectionStatus">{{share.meta.farmerState.portStatus.listenPort}} {{share.meta.farmerState.portStatus.connectionType}}</span></td>
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
