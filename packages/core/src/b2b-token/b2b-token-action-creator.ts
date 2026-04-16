import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import { B2BTokenActionType, LoadB2BTokenAction } from './b2b-token-actions';
import B2BTokenRequestSender from './b2b-token-request-sender';

// TODO: Remove once all stores have b2bServiceDetails configured in checkout settings
const DEFAULT_B2B_BASE_URL = '';
const DEFAULT_B2B_CLIENT_ID = '';

export default class B2BTokenActionCreator {
    constructor(private _requestSender: B2BTokenRequestSender) {}

    loadB2BToken(
        options?: RequestOptions,
    ): ThunkAction<LoadB2BTokenAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const { storeHash } = state.config.getStoreConfigOrThrow().storeProfile;
            const { b2bBaseUrl = DEFAULT_B2B_BASE_URL, b2bClientId = DEFAULT_B2B_CLIENT_ID } =
                state.config.getStoreConfigOrThrow().checkoutSettings.b2bServiceDetails ?? {};
            const { id: customerId } = state.customer.getCustomerOrThrow();
            const { channelId } = state.checkout.getCheckoutOrThrow();

            return concat(
                of(createAction(B2BTokenActionType.LoadB2BTokenRequested)),
                defer(async () => {
                    const { body } = await this._requestSender.getB2BToken(
                        b2bClientId,
                        customerId,
                        storeHash,
                        channelId,
                        b2bBaseUrl,
                        options,
                    );

                    return createAction(B2BTokenActionType.LoadB2BTokenSucceeded, {
                        token: body.data.token,
                    });
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(B2BTokenActionType.LoadB2BTokenFailed, error),
                ),
            );
        };
    }
}
