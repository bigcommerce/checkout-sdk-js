import { assign } from 'lodash';
import Action from './action';
import Reducer from './reducer';

export default function combineReducers<TState, TAction extends Action>(
    reducers: ReducerMap<TState, TAction>
): Reducer<TState, TAction> {
    return (state, action) =>
        Object.keys(reducers).reduce((result: TState, key) => {
            const reducer = reducers[key as keyof TState];
            const currentState = state ? state[key as keyof TState] : undefined;
            const newState = reducer(currentState, action);

            if (currentState === newState && result) {
                return result;
            }

            return assign({}, result, { [key]: newState });
        }, state);
}

export type ReducerMap<TState, TAction extends Action> = {
    [Key in keyof TState]: Reducer<TState[Key] | undefined, TAction>;
};
