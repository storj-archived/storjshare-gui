module.exports = {
  toUnit: function(bytes, unit) {
    switch(unit) {
      case 'KB':
      return Number(bytes / 1000).toFixed(0);
        break;
      case 'MB':
        return Number(bytes / 1000000).toFixed(0);
        break;
      case 'GB':
        return Number(bytes / 1000000000).toFixed(2);
        break;
      case 'TB':
        return Number(bytes / 1000000000000).toFixed(4);
        break;
    }
  }
};
