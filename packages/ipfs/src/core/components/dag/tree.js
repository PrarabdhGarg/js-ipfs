'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function * tree (cid, options = {}) { // eslint-disable-line require-await
    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.tree(cid, options.path, options)
  })
}
