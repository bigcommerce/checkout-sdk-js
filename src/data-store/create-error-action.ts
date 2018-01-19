import createAction from './create-action';

/**
 * @param {string} type
 * @param {Object} [payload]
 * @param {Object} [meta]
 * @return {Action}
 */
export default function createErrorAction(type, payload, meta) {
    return {
        ...createAction(type, payload, meta),
        error: true,
    };
}
