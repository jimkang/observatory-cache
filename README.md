observatory-cache
==================

Generates a (intended to be server-side) line-delimited JSON cache of GitHub (each line is a project or deed) and other API-related data for the Observatory browser app.

Installation
------------

 - Clone this repo
 - `npm install`
 - Create a `config.js` that looks like this:

     var config = {
      githubToken: '<Your GitHub token>'
    };

- Create `config.mk` that looks like this:

    SMUSER = <username to run as>
    SERVER = <server domain or IP>

- `make set-up-remote-directories`
- `make sync`
- SSH into your server and `make run`. Or schedule this via cron.

Usage
-----

    make run > your.json

License
-------

The MIT License (MIT)

Copyright (c) 2017 Jim Kang

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
