/**
 * @param {Observable<Action<T>>} action
 * @return {Observable<Action<T>>}
 * @template T
 */
export default function noopActionTransformer(action) {
    return action;
}
