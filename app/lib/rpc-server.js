#!/usr/bin/env node

'use strict';

const storjshare = require('storjshare-daemon');
const dnode = require('dnode');
let api = new storjshare.RPC();

dnode(api.methods).listen(45015, () => {
  process.send({state: 'init'});
});

process.on('uncaughtException', (err) => {
  let error = Object.assign({}, err)
  process.send({error: err.stack}); //'A Fatal Exception has occured in the storjshare-daemon RPC server'
});
