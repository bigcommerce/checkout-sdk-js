"use strict";
/**
 * @typedef {Object} PaymentResponseBody
 * @property {string} status
 * @property {string} id
 * @property {AvsResult} avs_result
 * @property {CvvResult} cvv_result
 * @property {ThreeDsResult} three_ds_result
 * @property {boolean} fraud_review
 * @property {string} transaction_type
 * @property {Array<{ code: string, message: string }>} errors
 */
/**
 * @typedef {Object} AvsResult
 * @property {string} code
 * @property {string} message
 * @property {string} street_match
 * @property {string} postal_match
 */
/**
 * @typedef {Object} CvvResult
 * @property {string} code
 * @property {string} message
 */
/**
 * @typedef {Object} ThreeDsResult
 * @property {string} acs_url
 * @property {string} payer_auth_request
 * @property {string} merchant_data
 * @property {string} callback_url
 */
//# sourceMappingURL=payment-response-body.typedef.js.map