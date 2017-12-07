import { curryRight, flowRight } from 'lodash';

/**
 * @param {...Reducer} reducers
 * @return {Reducer}
 */
export default function composeReducers(...reducers) {
    return (state, action) =>
        flowRight(...reducers.map(reducer =>
            curryRight(reducer)(action)
        ))(state);
}
