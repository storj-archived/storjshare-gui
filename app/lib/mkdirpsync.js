const fs = require('fs');
const path = require('path');

module.exports = function mkdirPSync(dirpath, made) {
  if(!made) {
    made = null;
  }

  dirpath = path.normalize(dirpath);
  try {
    fs.mkdirSync(dirpath);
    made = made || dirpath;
  } catch (err) {
    if(err.code === 'ENOENT') {
      made = mkdirPSync(path.dirname(dirpath), made);
      mkdirPSync(dirpath, made);
    } else {
      let stat;
      try {
        stat = fs.statSync(dirpath);
        if (!stat.isDirectory()) throw err;
      }
      catch (err) {
        throw err;
      }
    }
  }
  return made;
};
