/**
 * @param {Object<string, Reducer>} reducers
 * @return {Reducer}
 */
export default function combineReducers(reducers) {
    return (state, action) =>
        Object.keys(reducers).reduce((result, key) => {
            const reducer = reducers[key];
            const currentState = state ? state[key] : undefined;
            const newState = reducer(currentState, action);

            if (currentState === newState && result) {
                return result;
            }

            return { ...result, [key]: newState };
        }, state);
}
