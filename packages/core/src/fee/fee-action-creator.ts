import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { FeeRequestBody } from './fee';
import { FeeAction, FeeActionType } from './fee-actions';
import FeeRequestSender from './fee-request-sender';

// Mirrors StoreCreditActionCreator. The ApplyFeesSucceeded action carries the updated
// Checkout returned by the Fees API, which the checkout reducer merges into state
// (Checkout.fees + grandTotal + outstandingBalance) — same pattern as store credit /
// coupons, so the order summary re-renders with the surcharge.
export default class FeeActionCreator {
    constructor(private _feeRequestSender: FeeRequestSender) {}

    applyFees(
        fees: FeeRequestBody[],
        options?: RequestOptions,
    ): ThunkAction<FeeAction, InternalCheckoutSelectors> {
        return (store) =>
            concat(
                of(createAction(FeeActionType.ApplyFeesRequested)),
                defer(async () => {
                    const checkout = store.getState().checkout.getCheckout();

                    if (!checkout) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                    }

                    // Send the checkout version for optimistic concurrency (like store credit),
                    // so an in-flight surcharge doesn't clash with a concurrent checkout update.
                    const version = options?.version ?? checkout.version;

                    const { body } = await this._feeRequestSender.applyFees(checkout.id, fees, {
                        ...options,
                        version,
                    });

                    return createAction(FeeActionType.ApplyFeesSucceeded, body);
                }),
            ).pipe(catchError((error) => throwErrorAction(FeeActionType.ApplyFeesFailed, error)));
    }
}
