import { combineReducers } from '../../data-store';

/**
 * @param {ConfigState} state
 * @return {ConfigState}
 */
export default function configReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Config} data
 * @return {?Config}
 */
function dataReducer(data) {
    return data;
}
