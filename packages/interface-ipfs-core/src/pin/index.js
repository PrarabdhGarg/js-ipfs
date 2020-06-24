'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  ls: require('./ls'),
  query: require('./query'),
  rm: require('./rm')
}

module.exports = createSuite(tests)
