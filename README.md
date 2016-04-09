Storj Farmer GUI
================

[![Build Status](https://img.shields.io/appveyor/ci/Storj/farmer-gui/master.svg?label=Build)](https://ci.appveyor.com/project/Storj/farmer-gui/branch/master)
[![Test Status](https://img.shields.io/travis/Storj/farmer-gui/master.svg?label=Test)](https://travis-ci.org/Storj/farmer-gui)
[![Coverage Status](https://img.shields.io/coveralls/Storj/farmer-gui/master.svg?label=Coverage)](https://coveralls.io/github/Storj/farmer-gui?branch=master)
[![License](https://img.shields.io/badge/license-GPLv3-blue.svg)](https://github.com/Storj/farmer-gui/blob/master/LICENSE)

Storj Farmer is a cross-platform desktop application enabling users to earn money
by sharing their extra hard drive space.

Quick Start
-----------

If you wish only to run the application, download a pre-built release from our
[releases page](https://github.com/Storj/dataserv-client/releases). If you wish
to build from source, follow the instructions below.

### Prerequisites

* [Git](https://git-scm.org)
* [Node.js](https://nodejs.org)

> If you do not have [Node.js](https://nodejs.org) installed already, install
> it with [NVM](https://github.com/creationix/nvm).

### Setup

Clone this repository and install dependencies with NPM.

```bash
git clone https://github.com/Storj/farmer-gui.git && cd farmer-gui
npm install
```

Then you can start the application. Please note that the "Launch Driveshare on
User Login" option works with only packaged releases.

```bash
npm start
```

Development
-----------

Unlike a traditional Node.js project, this one has 2 separate `package.json`
files: `package.json` and `app/package.json`. The one in the root directory
only contains dependencies for the [Electron](http://electron.atom.io/)-based
build system. It is unlikely that you will need to modify this.

The `app/package.json` contains all of the application's dependencies. For more
information on contributing to DriveShare, see `CONTRIBUTING.md`.

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

Copyright (c) 2015 Storj Labs


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
