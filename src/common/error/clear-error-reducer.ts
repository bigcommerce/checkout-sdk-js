import { Action } from '@bigcommerce/data-store';

import { omitDeep } from '../utility';

import { ClearErrorAction, ErrorActionType } from './error-actions';

export default function clearErrorReducer<TState extends { [key: string]: any }, TAction extends Action>(
    state: TState,
    action: TAction
): TState | undefined {
    if (isClearErrorAction(action)) {
        return omitDeep(state, value => value === action.payload);
    }

    return state;
}

function isClearErrorAction(action: Action): action is ClearErrorAction {
    return action.type === ErrorActionType.ClearError;
}
