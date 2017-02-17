module.exports = {
  components: {
    'overview-nav': require('./nav'),
    'overview-footer': require('./footer')
  },
  template: `
<transition name="fade">
  <section>
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
                  <th>Balance</th>
                  <th>Uptime</th>
                  <th>Restarts</th>
                  <th>Peers</th>
                  <th>Shared</th>
                  <th class="text-right">
                    <div class="dropdown">
                      <a class="node-options btn-secondary dropdown-toggle" href="" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="imgs/icon-settings.svg" alt="Options">
                      </a>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="#">Start</a>
                        <a class="dropdown-item" href="#">Stop</a>
                        <a class="dropdown-item" href="#">Restart</a>
                        <a class="dropdown-item" href="#">Delete</a>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="checkbox" class="checkbox"></td>
                  <td>#1</td>
                  <td class="node-status-on">ON</td>
                  <td class="sjcx">25,920 <span>SJCX</span></td>
                  <td>99.6%</td>
                  <td>1</td>
                  <td>1,799</td>
                  <td>85%</td>
                  <td class="text-right">
                    <div class="dropdown">
                      <a class="node-options btn-secondary dropdown-toggle" href="" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="imgs/icon-settings.svg" alt="Options">
                      </a>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="#">Start</a>
                        <a class="dropdown-item" href="#">Stop</a>
                        <a class="dropdown-item" href="#">Restart</a>
                        <a class="dropdown-item" href="#">Logs</a>
                        <a class="dropdown-item" href="#">Edit</a>
                        <a class="dropdown-item" href="#">Advanced</a>
                        <a class="dropdown-item" href="#">Delete</a>
                      </div>
                    </div>
                  </td>
                </tr><tr>
                  <td><input type="checkbox" class="checkbox"></td>
                  <td>#2</td>
                  <td class="node-status-on">ON</td>
                  <td class="sjcx">20,772 <span>SJCX</span></td>
                  <td>98.5%</td>
                  <td>2</td>
                  <td>824</td>
                  <td>92%</td>
                  <td class="text-right">
                    <div class="dropdown">
                      <a class="node-options btn-secondary dropdown-toggle" href="" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="imgs/icon-settings.svg" alt="Options">
                      </a>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="#">Start</a>
                        <a class="dropdown-item" href="#">Stop</a>
                        <a class="dropdown-item" href="#">Restart</a>
                        <a class="dropdown-item" href="#">Logs</a>
                        <a class="dropdown-item" href="#">Edit</a>
                        <a class="dropdown-item" href="#">Advanced</a>
                        <a class="dropdown-item" href="#">Delete</a>
                      </div>
                    </div>
                  </td>
                </tr><tr>
                  <td><input type="checkbox" class="checkbox"></td>
                  <td>#3</td>
                  <td class="node-status-on">ON</td>
                  <td class="sjcx">12,188 <span>SJCX</span></td>
                  <td>93.0%</td>
                  <td>6</td>
                  <td>179</td>
                  <td>85%</td>
                  <td class="text-right">
                    <div class="dropdown">
                      <a class="node-options btn-secondary dropdown-toggle" href="" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="imgs/icon-settings.svg" alt="Options">
                      </a>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="#">Start</a>
                        <a class="dropdown-item" href="#">Stop</a>
                        <a class="dropdown-item" href="#">Restart</a>
                        <a class="dropdown-item" href="#">Logs</a>
                        <a class="dropdown-item" href="#">Edit</a>
                        <a class="dropdown-item" href="#">Advanced</a>
                        <a class="dropdown-item" href="#">Delete</a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr class="node-off">
                  <td><input type="checkbox" class="checkbox"></td>
                  <td>#4</td>
                  <td class="node-status-off">OFF</td>
                  <td>12,598 <span>SJCX</span></td>
                  <td>81.2%</td>
                  <td>14</td>
                  <td>0</td>
                  <td>54%</td>
                  <td class="text-right">
                    <div class="dropdown">
                      <a class="node-options btn-secondary dropdown-toggle" href="" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="imgs/icon-settings.svg" alt="Options">
                      </a>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="#">Start</a>
                        <a class="dropdown-item" href="#">Stop</a>
                        <a class="dropdown-item" href="#">Restart</a>
                        <a class="dropdown-item" href="#">Logs</a>
                        <a class="dropdown-item" href="#">Edit</a>
                        <a class="dropdown-item" href="#">Advanced</a>
                        <a class="dropdown-item" href="#">Delete</a>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr class="node-off">
                  <td><input type="checkbox" class="checkbox"></td>
                  <td>#5</td>
                  <td class="node-status-off">OFF</td>
                  <td>240 <span>SJCX</span></td>
                  <td>21%</td>
                  <td>25</td>
                  <td>0</td>
                  <td>10%</td>
                  <td class="text-right">
                    <div class="dropdown">
                      <a class="node-options btn-secondary dropdown-toggle" href="" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="imgs/icon-settings.svg" alt="Options">
                      </a>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="#">Start</a>
                        <a class="dropdown-item" href="#">Stop</a>
                        <a class="dropdown-item" href="#">Restart</a>
                        <a class="dropdown-item" href="#">Logs</a>
                        <a class="dropdown-item" href="#">Edit</a>
                        <a class="dropdown-item" href="#">Advanced</a>
                        <a class="dropdown-item" href="#">Delete</a>
                      </div>
                    </div>
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
