module.exports = {
  components: {
    'ext-a' : require('../external-anchor')
  },
  template: `
<footer class="footer">
  <div class="container text-center">
    <small class="mr-4"><ext-a href="https://storj.io/share.html">Website</ext-a></small>
    <small class="mr-4"><ext-a href="https://github.com/Storj/storjshare-gui/">Source Code</ext-a></small>
    <small class="mr-4"><ext-a href="https://github.com/Storj/storjshare-daemon">CLI</ext-a></small>
    <small class="mr-4"><ext-a href="https://storj.io/community.html">Community</ext-a></small>
    <small class="mr-4"><ext-a href="https://docs.storj.io/discuss">Need Help?</ext-a></small>
  </div>
</footer>
  `
};
