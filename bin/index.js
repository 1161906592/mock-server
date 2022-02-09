#!/usr/bin/env node
const creatMockServer = require("../lib");

const argv = require('minimist')(process.argv.slice(2), { string: ['_'] })

creatMockServer({
  root: argv[0] || "mock"
})
