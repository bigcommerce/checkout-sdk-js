/**
 * @param {T} state
 * @return {T}
 * @template T
 */
export default function noopStateTransformer(state) {
    return state;
}
