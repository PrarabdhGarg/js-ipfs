'use strict'

const PeerId = require('peer-id')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ bitswap }) => {
  return withTimeoutOption(async function wantlist (options = {}) { // eslint-disable-line require-await
    const list = options.peer
      ? bitswap.wantlistForPeer(PeerId.createFromCID(options.peer))
      : bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  })
}
