/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const CID = require('cids')
const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const { withTimeoutOption } = require('../../utils')

module.exports = ({ pinManager }) => {
  return withTimeoutOption(async function * ls (options = {}) {
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

    // show all pinned items of type
    let pins = []

    if (type === PinTypes.direct || type === PinTypes.all) {
      pins = pins.concat(
        Array.from(pinManager.directPins).map(cid => ({
          type: PinTypes.direct,
          cid: new CID(cid)
        }))
      )
    }

    if (type === PinTypes.recursive || type === PinTypes.all) {
      pins = pins.concat(
        Array.from(pinManager.recursivePins).map(cid => ({
          type: PinTypes.recursive,
          cid: new CID(cid)
        }))
      )
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      const indirects = await pinManager.getIndirectKeys(options)

      pins = pins
        // if something is pinned both directly and indirectly,
        // report the indirect entry
        .filter(({ cid }) => !indirects.includes(cid.toString()) || !pinManager.directPins.has(cid.toString()))
        .concat(indirects.map(cid => ({ type: PinTypes.indirect, cid: new CID(cid) })))
    }

    // FIXME: https://github.com/ipfs/js-ipfs/issues/2244
    yield * pins
  })
}
