#!/bin/bash
pushd ./app/node_modules/leveldown && node-gyp rebuild --target=1.2.6 --dist-url=https://atom.io/download/atom-shell
popd
