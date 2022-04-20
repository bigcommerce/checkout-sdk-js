import { Action } from '@bigcommerce/data-store';
import { from, Observable, Subscribable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RequestErrorFactory } from '../common/error';

export default function createActionTransformer(
    requestErrorFactory: RequestErrorFactory
): (action: Subscribable<Action>) => Observable<Action> {
    return action$ => from(action$).pipe(catchError<Action, never>(action => {
        if (action instanceof Error || action.payload instanceof Error) {
            throw action;
        }

        if (isResponse(action.payload)) {
            const message = action.payload.body && action.payload.body.detail;

            throw { ...action, payload: requestErrorFactory.createError(action.payload, message) };
        }

        throw action;
    }));
}

function isResponse(object: any) {
    if (!object || typeof object !== 'object') {
        return false;
    }

    return ['body', 'headers', 'status', 'statusText'].every(key =>
        object.hasOwnProperty(key)
    );
}
