import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import { B2BTokenActionType, LoadB2BTokenAction } from './b2b-token-actions';
import B2BTokenRequestSender from './b2b-token-request-sender';

export default class B2BTokenActionCreator {
    constructor(private _requestSender: B2BTokenRequestSender) {}

    loadB2BToken(
        appClientId: string,
        options?: RequestOptions,
    ): ThunkAction<LoadB2BTokenAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const { storeHash } = state.config.getStoreConfigOrThrow().storeProfile;
            const { id: customerId } = state.customer.getCustomerOrThrow();
            const { channelId } = state.checkout.getCheckoutOrThrow();

            return concat(
                of(createAction(B2BTokenActionType.LoadB2BTokenRequested)),
                defer(async () => {
                    const { body: jwtBody } = await this._requestSender.getBCJWT(
                        appClientId,
                        options,
                    );
                    const { body } = await this._requestSender.exchangeForB2BToken(
                        jwtBody.token,
                        customerId,
                        storeHash,
                        channelId,
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
