import { omitBy } from 'lodash';

/**
 * @param {string} type
 * @param {Object} [payload]
 * @param {Object} [meta]
 * @return {Action}
 */
export default function createAction(type, payload, meta) {
    if (typeof type !== 'string') {
        throw new Error('`type` must be a string');
    }

    return omitBy({
        type,
        payload,
        meta,
    }, value => value === undefined);
}
