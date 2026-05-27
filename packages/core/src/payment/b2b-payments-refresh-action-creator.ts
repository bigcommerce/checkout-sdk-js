import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import {
    B2BPaymentsRefreshActionType,
    RefreshB2BPaymentMethodsAction,
} from './b2b-payments-refresh-actions';
import B2BPaymentsRefreshRequestSender from './b2b-payments-refresh-request-sender';

export default class B2BPaymentsRefreshActionCreator {
    constructor(private _requestSender: B2BPaymentsRefreshRequestSender) {}

    refreshB2BPaymentMethods(
        options?: RequestOptions,
    ): ThunkAction<RefreshB2BPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const paymentMethods = state.paymentMethods.getPaymentMethods() ?? [];
            const b2bToken = state.b2bToken.getToken();
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );

            if (!b2bToken || !b2bBaseUrl) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            const payments = paymentMethods.map((method) => ({
                code: method.id,
                name: method.config?.displayName || method.gateway || '',
            }));

            return concat(
                of(createAction(B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsRequested)),
                defer(async () => {
                    await this._requestSender.refresh(payments, b2bToken, b2bBaseUrl, options);

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
