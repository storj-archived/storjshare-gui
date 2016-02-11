DriveShare
==========

[![Build Status](https://img.shields.io/appveyor/ci/Storj/driveshare-gui/master.svg?label=Build-Master)](https://ci.appveyor.com/project/littleskunk/driveshare-gui/branch/master)
[![Test Status](https://img.shields.io/travis/Storj/driveshare-gui/master.svg?label=Test-Master)](https://travis-ci.org/Storj/driveshare-gui)
[![Coverage Status](https://img.shields.io/coveralls/Storj/driveshare-gui/master.svg?label=Coverage-Master)](https://coveralls.io/github/Storj/driveshare-gui?branch=master)
[![Build Status](https://img.shields.io/appveyor/ci/Storj/driveshare-gui/develop.svg?label=Build-Master)](https://ci.appveyor.com/project/littleskunk/driveshare-gui/branch/develop)
[![Test Status](https://img.shields.io/travis/Storj/driveshare-gui/develop.svg?label=Test-Develop)](https://travis-ci.org/Storj/driveshare-gui)
[![Coverage Status](https://img.shields.io/coveralls/Storj/driveshare-gui/develop.svg?label=Coverage-Develop)](https://coveralls.io/github/Storj/driveshare-gui?branch=develop)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Storj/driveshare-gui/blob/master/LICENSE)

DriveShare is a cross-platform desktop application enabling users to earn money
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
git clone https://github.com/Storj/driveshare-gui.git && cd driveshare-gui
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


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
