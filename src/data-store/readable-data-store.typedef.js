/**
 * @interface ReadableDataStore
 * @template TransformedState
 */

/**
 * @function
 * @name ReadableDataStore#getState
 * @returns {TransformedState}
 */

/**
 * @function
 * @name ReadableDataStore#subscribe
 * @param {function(state: TransformedState): void} subscriber
 * @param {...function(state: TransformedState): any} [filters]
 * @return {function(): void}
 */
