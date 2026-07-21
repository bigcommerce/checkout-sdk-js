import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bAppClientId, resolveB2bBaseUrl } from '../b2b-dev-tools';
import { B2BTokenRequestSender } from '../b2b-token';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import {
    B2BPaymentsRefreshActionType,
    RefreshB2BPaymentMethodsAction,
} from './b2b-payments-refresh-actions';
import B2BPaymentsRefreshRequestSender from './b2b-payments-refresh-request-sender';

export default class B2BPaymentsRefreshActionCreator {
    constructor(
        private _requestSender: B2BPaymentsRefreshRequestSender,
        private _b2bTokenRequestSender: B2BTokenRequestSender,
    ) {}

    refreshB2BPaymentMethods(
        options?: RequestOptions,
    ): ThunkAction<RefreshB2BPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const paymentMethods = state.paymentMethods.getPaymentMethods() ?? [];
            const b2bToken = state.b2bToken.getToken();
            const storeConfig = state.config.getStoreConfig();
            const b2bBaseUrl = resolveB2bBaseUrl(storeConfig?.b2bApiSettings?.baseUrl ?? '');

            const payments = paymentMethods.map((method) => ({
                code: method.id,
                name: method.config?.displayName || method.gateway || '',
            }));

            return concat(
                of(createAction(B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsRequested)),
                defer(async () => {
                    const isGuest = state.customer.getCustomer()?.isGuest ?? false;

                    let bcToken: string | undefined;

                    if (!b2bToken && !isGuest) {
                        const b2bClientId = resolveB2bAppClientId(
                            storeConfig?.b2bApiSettings?.clientId ?? '',
                        );

                        bcToken = await this._b2bTokenRequestSender.getCurrentCustomerJWT(
                            b2bClientId,
                        );
                    }

                    await this._requestSender.refresh(
                        payments,
                        { b2bToken, bcToken },
                        b2bBaseUrl,
                        options,
                    );

                    return createAction(
                        B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsSucceeded,
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(
                        B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsFailed,
                        error,
                    ),
                ),
            );
        };
    }
}
