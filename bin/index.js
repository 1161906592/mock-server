#!/usr/bin/env node
const creatMockServer = require("../lib").default;

const argv = require('minimist')(process.argv.slice(2), { string: ['_'] })

creatMockServer({
  root: argv.root || "mock"
})
