"use strict";
/**
 * @typedef {Object} InstrumentBillingAddress
 * @property {string} addressLine1
 * @property {string} addressLine2
 * @property {string} city
 * @property {string} company
 * @property {string} country
 * @property {string} countryCode
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} phone
 * @property {string} postCode
 * @property {string} province
 * @property {string} provinceCode
 */
/**
* @typedef {Object} ThreeDSecure
* @property {string} version
* @property {string} status
* @property {string} vendor
* @property {string} cavv
* @property {string} eci
* @property {string} xid
*/
/**
* @typedef {Object} InstrumentCreditCard
* @property {string} cardholderName
* @property {string} number
* @property {number} month
* @property {number} year
* @property {string} verificationCode
* @property {number} issueMonth
* @property {number} issueYear
* @property {number} issueNumber
* @property {string} trackData
* @property {boolean} isManualEntry
* @property {string} iccData
* @property {string} fallbackReason
* @property {boolean} isContactless
* @property {string} encryptedPinCryptogram
* @property {string} encryptedPinKsn
* @property {ThreeDSecure} threeDSecure
*/
/**
 * @typedef {Object} InstrumentRequestBody
 * @param {InstrumentBillingAddress} billingAddress
 * @param {InstrumentCreditCard} creditCard
 * @param {boolean} defaultInstrument
 * @param {string} providerName
 */
//# sourceMappingURL=instrument-request-body.typedef.js.map