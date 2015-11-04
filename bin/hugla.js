#!/usr/bin/env node

"use strict";

const program = require('commander');
const pkg = require(__dirname + '/../package.json');

program
  .version(pkg.version)
  .parse(process.argv);
