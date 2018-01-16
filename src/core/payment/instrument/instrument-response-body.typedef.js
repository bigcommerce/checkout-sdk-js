/**
 * @typedef {Object} InstrumentError
 * @property {string} code
 * @property {string} message
 */

 /**
  * @typedef {Object} VaultAccessTokenResponseBody
  * @property {string} token
  * @property {InstrumentError[]} errors
  */

 /**
  * @typedef {Object} InstrumentResponseBody
  * @property {Instrument} vaulted_instrument
  * @property {InstrumentError[]} errors
  */

 /**
  * @typedef {Object} InstrumentsResponseBody
  * @property {Array<Instrument>} vaulted_instruments
  * @property {InstrumentError[]} errors
  */
