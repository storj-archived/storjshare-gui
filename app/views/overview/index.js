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
        selectedShares: []
      }
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
                <th><input type="checkbox" class="checkbox" id="selectAll"></th>
                <th>#</th>
                <th>Status</th>
                <!-- <th>Balance</th> -->
                <th>Uptime</th>
                <th>Restarts</th>
                <th>Peers</th>
                <th>Shared</th>
                <th class="text-right">
                  <b-dropdown text="Right align">
                    <span slot="text">
                      <img src="imgs/icon-settings.svg" alt="Options"/>
                    </span>
                    <a v-on:click.prevent="store.actions.start(uiState.selectedShares)" class="dropdown-item" href="#">Start</a>
                    <a v-on:click.prevent="store.actions.stop(uiState.selectedShares)" class="dropdown-item" href="#">Stop</a>
                    <a v-on:click.prevent="store.actions.start(uiState.selectedShares)" class="dropdown-item" href="#">Restart</a>
                    <a v-on:click.prevent="store.actions.logs(uiState.selectedShares)" class="dropdown-item" href="#">Logs</a>
                    <a v-on:click.prevent="store.actions.delete(uiState.selectedShares)" class="dropdown-item" href="#">Delete</a>
                  </b-dropdown>
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
