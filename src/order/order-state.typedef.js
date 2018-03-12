/**
 * @typedef {Object} OrderState
 * @property {?InternalOrder} data
 * @property {?OrderMeta} meta
 * @property {Object} errors
 * @property {?ErrorResponse} errors.loadError
 * @property {?ErrorResponse} errors.submitError
 * @property {?ErrorResponse} errors.finalizeError
 * @property {Object} statuses
 * @property {?boolean} statuses.isLoading
 * @property {?boolean} statuses.isSubmitting
 * @property {?boolean} statuses.isFinalizing
 */

/**
 * @typedef {Object} OrderMeta
 * @property {string} deviceFingerprint
 * @property {string} token
 */
