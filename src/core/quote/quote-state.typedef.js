/**
 * @typedef {Object} QuoteState
 * @property {?Quote} data
 * @property {?QuoteMeta} meta
 * @property {Object} errors
 * @property {?ErrorResponse} errors.loadError
 * @property {?ErrorResponse} errors.updateBillingAddressError
 * @property {?ErrorResponse} errors.updateShippingAddressError
 * @property {Object} statuses
 * @property {?boolean} statuses.isLoading
 * @property {?boolean} statuses.isUpdatingBillingAddress
 * @property {?boolean} statuses.isUpdatingShippingAddress
 */

/**
 * @typedef {Object} QuoteMeta
 * @property {Object} request
 * @property {string} request.geoCountryCode
 * @property {string} request.deviceSessionId
 * @property {string} request.sessionHash
 */
