/**
 * @param {RequestErrorFactory} requestErrorFactory
 * @return {function(action: Observable<Action<T>>): Observable<Action<T>>}
 */
export default function createActionTransformer(requestErrorFactory) {
    return (action$) => action$.catch((action) => {
        if (action instanceof Error || action.payload instanceof Error) {
            throw action;
        }

        if (isResponse(action.payload)) {
            throw { ...action, payload: requestErrorFactory.createError(action.payload) };
        }

        throw action;
    });
}

/**
 * @private
 * @param {Object} object
 * @return {boolean}
 */
function isResponse(object) {
    if (!object || typeof object !== 'object') {
        return false;
    }

    return ['body', 'headers', 'status', 'statusText'].every((key) =>
        object.hasOwnProperty(key)
    );
}
