import { Action, ThunkAction } from '@bigcommerce/data-store';
import { memoize } from '@bigcommerce/memoize';
import { from, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export default function cacheAction<TFunction extends CreateActionFn>(
    fn: TFunction
): TFunction {
    function decoratedFn(this: any, ...args: any[]) {
        const action = fn.call(this, ...args);

        if (action instanceof Observable) {
            return from(action).pipe(shareReplay());
        }

        if (typeof action === 'function') {
            return memoize(store => from(action(store)).pipe(shareReplay()));
        }

        return action;
    }

    return memoize(decoratedFn as TFunction);
}

type CreateActionFn = (...args: any[]) => Observable<Action> | ThunkAction<Action> | Action;
