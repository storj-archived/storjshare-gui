module.exports = {
  components: {
    'overview-nav': require('./nav'),
    'overview-footer': require('./footer'),
    'error': require('../notification'),
    'log-modal': require('../logs'),
    'dropdown' : require('../dropdown')
  },
  data: function() {
    return {
      store: window.Store.shareList,
      uiState: {
        showLogId: '',
        selectedShares: []
      }
    }
  },
  created: function() {
    this.store.actions.status(() => {
      this.store.actions.poll().start(this.pollInterval);
    });

  },
  destroyed: function() {
    this.store.actions.poll().stop();
  },
  methods: {
    closeLogs: () => {
      this.store.logText = '';
    },
    openLogs: (id) => {
      this.uiState.showLogId = id;
      this.store.actions.readLogs(id);
    }
  },
  template: `
<transition name="fade">
  <section>
    <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="store.errors" v-bind:dismiss-action="store.actions.clearErrors"></error>
    <log-modal :show="store.logText && store.logText.length > 0" :share-id="uiState.showLogId" :close-action="closeLogs">
      <textarea readonly>
        {{store.logText}}
      </textarea>
    </log-modal>

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
                <th><input type="checkbox" class="checkbox" id="selectAll"></th>
                <th>#</th>
                <th>Status</th>
                <!-- <th>Balance</th> -->
                <th>Uptime</th>
                <th>Restarts</th>
                <th>Peers</th>
                <th>Shared</th>
                <th class="text-right">

                  <dropdown id="dropdownMenuHeadLink">
                    <img slot="img" src="imgs/icon-settings.svg" alt="Options">

                    <div slot="links">
                      <a v-on:click.prevent="store.actions.start(uiState.selectedShares)" class="dropdown-item" href="#">Start</a>
                      <a v-on:click.prevent="store.actions.stop(uiState.selectedShares)" class="dropdown-item" href="#">Stop</a>
                      <a v-on:click.prevent="store.actions.start(uiState.selectedShares)" class="dropdown-item" href="#">Restart</a>
                      <a v-on:click.prevent="store.actions.logs(uiState.selectedShares)" class="dropdown-item" href="#">Logs</a>
                      <a v-on:click.prevent="store.actions.delete(uiState.selectedShares)" class="dropdown-item" href="#">Delete</a>
                    </div>
                  </dropdown>

                </th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="(share, index) in store.shares" :key="share.id">
                <td><input type="checkbox" class="checkbox"></td>
                <td>{{share.id}}</td>
                <td :class="{'node-status-on': share.isRunning, 'node-status-off': !share.isRunning}"></td>
                <!-- <td class="sjcx">25,920 <span>SJCX</span></td> -->
                <td>{{share.meta.uptimeReadable}}</td>
                <td>{{share.meta.numRestarts}}</td>
                <td>{{share.meta.farmerState.totalPeers}}</td>
                <td>{{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}) %)</td>
                <td class="text-right">

                <dropdown :id="'dropdownMenuLink' + share.id">
                  <img slot="img" src="imgs/icon-settings.svg" alt="Options"></img>

                  <div slot="links">
                    <a v-on:click.prevent="store.actions.start(share.id)" class="dropdown-item" href="#">Start</a>
                    <a v-on:click.prevent="store.actions.stop(share.id)" class="dropdown-item" href="#">Stop</a>
                    <a v-on:click.prevent="store.actions.start(share.id)" class="dropdown-item" href="#">Restart</a>
                    <a v-on:click.prevent="store.actions.logs(share.id)" class="dropdown-item" href="#">Logs</a>
                    <a class="dropdown-item" href="#">Edit</a>
                    <!-- <a v-on:click.prevent="store.actions.advanced(share.id)" class="dropdown-item" href="#">Advanced</a> -->
                    <a v-on:click.prevent="store.actions.delete(share.id)" class="dropdown-item" href="#">Delete</a>
                  </div>

                </dropdown>
                </td>
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


/*
<div id="overview">
  <ul>
    <li v-for="(share, index) in shares">
      <!--
        - Use {{share.[propname]}} to render share status data
        - Configuration may be modified by changing
          {{share.config[propname]}} (use v-model on fields)
        - Use saveShareConfig(index) to persist config changes
      -->
    </li>
  </ul>
</div>
*/
