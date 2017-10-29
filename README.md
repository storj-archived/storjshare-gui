Storj Share
================

[![Test Status](https://img.shields.io/travis/Storj/storjshare-gui/master.svg?label=tests&style=flat-square)](https://travis-ci.org/Storj/storjshare-gui)
[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg?label=license&style=flat-square)](https://github.com/Storj/storjshare-gui/blob/master/LICENSE)

[Storj Share](https://storj.io/share.html) is a cross-platform desktop application enabling users to earn money
by sharing their extra hard drive space on the [Storj](https://storj.io) network.

Quick Start
-----------

If you wish only to run the application, download a pre-built release from our
[releases page](https://github.com/Storj/storjshare-gui/releases) or use snapd to install storjshare-gui in seconds on [Ubuntu and other snap supported Linux distributions](https://snapcraft.io/docs/core/install) with:


    snap download storjshare-gui --beta
    snap install storjshare-gui --beta

Installing a snap is very quick. Snaps are secure. They are isolated with all of their dependencies. Snaps also auto update when a new version is released.

If you wish to build from source, follow the instructions below.

### Prerequisites

* [Git](https://git-scm.org)
* [Node.js 8.x.x](https://nodejs.org)
* [node-gyp](https://github.com/nodejs/node-gyp)

> If you do not have [Node.js](https://nodejs.org) installed already, install
> it with [NVM](https://github.com/creationix/nvm).

### Setup

Clone this repository and install dependencies with NPM.

```bash
git clone https://github.com/Storj/storjshare-gui.git && cd storjshare-gui
npm install
```

Then you can start the application.

```bash
npm --production start
```

Development
-----------

Unlike a traditional Node.js project, this one has 2 separate `package.json`
files: `package.json` and `app/package.json`. The one in the root directory
only contains dependencies for the [Electron](http://electron.atom.io/)-based
build system. It is unlikely that you will need to modify this.

The `app/package.json` contains all of the application's dependencies. For more
information on contributing to Storj Share, see `CONTRIBUTING.md`.

Building
--------

You can package a release for GNU/Linux, OSX, and Windows, by running the
following from the project's root directory.

```bash
npm run release
```

Once completed, your bundle will be placed in `releases/`. You can only bundle
a release for the operating system on which you are running, so in order to
build for all supported platforms, you will need to have access to each
operating system.

You can use [xdissent/ievms](https://github.com/xdissent/ievms) to setup a
virtual machine for Windows if you are on GNU/Linux or OSX. If you are running
GNU/Linux, there are a number of resources available for setting up a virtual
machine for OSX.

> On Windows, [NSIS](http://nsis.sourceforge.net/Main_Page) is used. You have
> to install it (version 3.0), and add NSIS folder to PATH in environment
> variables, so it is reachable to scripts in this project (path should look
> something like `C:/Program Files (x86)/NSIS`).

License
-------
```
storjshare-gui - Cross-platform desktop application fop sharing user's extra hard drive space.
Copyright (c) 2017 Storj Labs Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
```
