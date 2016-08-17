#!/bin/bash
ls
pushd ./app/node_modules/storj/node_modules/leveldown && node-gyp rebuild --target=1.2.6 --dist-url=https://atom.io/download/atom-shell
popd
pushd ./../../../leveldown/ && node-gyp rebuild --target=1.2.6 --dist-url=https://atom.io/download/atom-shell
popd
