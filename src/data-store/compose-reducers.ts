import { curryRight, flowRight } from 'lodash';
import Action from './action';
import Reducer from './reducer';

export default function composeReducers<TState, TAction extends Action>(
    ...reducers: Array<Reducer<Partial<TState>, TAction>>
): Reducer<TState, TAction> {
    return (state, action) =>
        flowRight.apply(
            null,
            reducers.map(reducer => curryRight(reducer)(action))
        )(state);
}
