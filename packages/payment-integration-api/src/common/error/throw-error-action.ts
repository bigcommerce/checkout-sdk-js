import { createErrorAction, Action } from '@bigcommerce/data-store';
import { concat, of, throwError, Observable } from 'rxjs';

export default function throwErrorAction<TPayload, TMeta, TType extends string>(
    type: TType,
    error?: TPayload,
    meta?: TMeta
): Observable<Action<TPayload, TMeta, TType>> {
    if (isErrorAction(error)) {
        return concat(of(error), throwError(createErrorAction(type, error.payload, meta)));
    }

    return throwError(createErrorAction(type, error, meta));
}

function isErrorAction(action: any): action is Action {
    return action && action.type && action.error;
}
