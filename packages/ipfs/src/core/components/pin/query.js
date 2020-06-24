/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { parallelMap } = require('streaming-iterables')
const { resolvePath } = require('../../utils')
const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const { withTimeoutOption } = require('../../utils')

const PIN_LS_CONCURRENCY = 8

module.exports = ({ pinManager, dag }) => {
  return withTimeoutOption(async function * query (paths, options = {}) {
    paths = Array.isArray(paths) ? paths : [paths]
    let type = PinTypes.all

    if (options.type) {
      type = options.type
      if (typeof options.type === 'string') {
        type = options.type.toLowerCase()
      }
      const err = PinManager.checkPinType(type)
      if (err) {
        throw err
      }
    }

    // check the pinned state of specific hashes
    const cids = await resolvePath(dag, paths)

    yield * parallelMap(PIN_LS_CONCURRENCY, async cid => {
      const { reason, pinned } = await pinManager.isPinnedWithType(cid, type)

      if (!pinned) {
        throw new Error(`path '${paths[cids.indexOf(cid)]}' is not pinned`)
      }

      if (reason === PinTypes.direct || reason === PinTypes.recursive) {
        return { cid, type: reason }
      }

      return { cid, type: `${PinTypes.indirect} through ${reason}` }
    }, cids)
  })
}
