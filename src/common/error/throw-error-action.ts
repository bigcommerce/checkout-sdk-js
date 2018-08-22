import { createErrorAction, Action } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import { Observable } from 'rxjs/Observable';

export default function throwErrorAction<TPayload, TMeta, TType extends string>(
    type: TType,
    error?: TPayload,
    meta?: TMeta
): Observable<Action<TPayload, TMeta, TType>> {
    if (isErrorAction(error)) {
        return concat(of(error), _throw(createErrorAction(type, error.payload, meta)));
    }

    return _throw(createErrorAction(type, error, meta));
}

function isErrorAction(action: any): action is Action {
    return action && action.type && action.error;
}
