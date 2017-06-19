'use strict';

module.exports = {
  data: function() {
    return {
      shareList: window.Store.shareList,
      ethAddress: ''
    };
  },
  components: {
    'ext-a' : require('../components/external-anchor')
  },
  methods: {
    checkEthereumAddress: require('../../lib/eth-address-check.js'),
    setEthAddressAndQuit: function() {
      for(let i = 0; i < this.shareList.shares.length; i++) {
        //Change the address
        let share = this.shareList.shares[i];
        share.config.paymentAddress = this.ethAddress;
        //Writes the config changes, and stops the node.
        this.shareList.actions.update(share.id);
        this.shareList.actions.stop(share.id);
      }
      return this.$router.push({ path: '/overview' });
    }
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/overview'}"><small>&lt; Overview</small></router-link>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Ethereum Address Migration</h2>
        <p>Storj has migrated to an Ethereum ERC20 token. Please provide your Ethereum address from a supported wallet to continue receiving payments.</p>
        <p><ext-a href="https://parity.io/">Parity</ext-a> &middot; <ext-a href="https://github.com/ethereum/mist/releases">Mist</ext-a> &middot; <ext-a href="https://www.myetherwallet.com/">MyEtherWallet</ext-a></p>
      </div>
    </div>
    <div class="row text-center mb-4 mt-3">
      <div class="col-12">
        <input type="text" v-model="ethAddress" class="address" placeholder="0xETHEREUM_ADDRESS_HERE">
        <button v-on:click="setEthAddressAndQuit()" class="btn" :disabled="!checkEthereumAddress(ethAddress)">CONFIRM</button>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <small>Your node will automatically stop after you apply these changes. Please restart your node for the changes to take effect.</small>
      </div>
    </div>
  </div>
</section>
  `
};
