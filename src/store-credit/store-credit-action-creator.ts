import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { StoreCreditAction, StoreCreditActionType } from './store-credit-actions';
import StoreCreditRequestSender from './store-credit-request-sender';

export default class StoreCreditActionCreator {
    constructor(
        private _storeCreditRequestSender: StoreCreditRequestSender
    ) {}

    applyStoreCredit(useStoreCredit: boolean, options?: RequestOptions): ThunkAction<StoreCreditAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(StoreCreditActionType.ApplyStoreCreditRequested)),
            defer(async () => {
                const state = store.getState();
                const checkout = state.checkout.getCheckout();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                const { body } = await (useStoreCredit ?
                    this._storeCreditRequestSender.applyStoreCredit(checkout.id, options) :
                    this._storeCreditRequestSender.removeStoreCredit(checkout.id, options));

                return createAction(StoreCreditActionType.ApplyStoreCreditSucceeded, body);
            })
        ).pipe(
            catchError(error => throwErrorAction(StoreCreditActionType.ApplyStoreCreditFailed, error))
        );
    }
}
