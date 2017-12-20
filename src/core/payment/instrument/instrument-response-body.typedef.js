/**
 * @typedef {Object} InstrumentError
 * @property {string} code
 * @property {string} message
 */

 /**
  * @typedef {Object} ShopperTokenResponseBody
  * @property {string} token
  * @property {InstrumentError[]} errors
  */

 /**
  * @typedef {Object} InstrumentsResponseBody
  * @property {Array<Instrument>} vaulted_instruments
  * @property {InstrumentError[]} errors
  */
