#!/usr/bin/env node

const path = require('path');

const program = require('commander');
const pkg = require(path.join(__dirname, '/../package.json'));

program
  .version(pkg.version)
  .parse(process.argv);
