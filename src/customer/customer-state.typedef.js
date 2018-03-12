/**
 * @typedef {Object} CustomerState
 * @property {InternalCustomer} data
 * @property {Object} errors
 * @property {?ErrorResponse} errors.signInError
 * @property {?ErrorResponse} errors.signOutError
 * @property {?ErrorResponse} errors.initializeError
 * @property {Object} statuses
 * @property {?boolean} statuses.isSigningIn
 * @property {?boolean} statuses.isSigningOut
 * @property {?boolean} statuses.isInitializing
 */
