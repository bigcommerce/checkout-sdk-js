import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { B2BOrderMetadataOptions } from './b2b-order-metadata';
import { B2BPreOrderActionType, PreOrderB2BMetadataAction } from './b2b-pre-order-actions';
import B2BPreOrderRequestSender from './b2b-pre-order-request-sender';

export default class B2BPreOrderActionCreator {
    constructor(private _requestSender: B2BPreOrderRequestSender) {}

    persistPreOrderB2BMetadata(
        { poNumber, referenceNumber, extraFields, extraInfo }: B2BOrderMetadataOptions,
        options?: RequestOptions,
    ): ThunkAction<PreOrderB2BMetadataAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const b2bToken = state.b2bToken.getToken();
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );
            const cartId = state.cart.getCartOrThrow().id;
            const paymentMethods = state.paymentMethods.getPaymentMethods() ?? [];

            if (!b2bToken || !b2bBaseUrl) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            const payments = paymentMethods.map((method) => ({
                code: method.id,
                name: method.config?.displayName || method.gateway || '',
            }));

            return concat(
                of(createAction(B2BPreOrderActionType.PreOrderB2BMetadataRequested)),
                defer(async () => {
                    await this._requestSender.refreshPaymentMethods(
                        payments,
                        b2bToken,
                        b2bBaseUrl,
                        options,
                    );
                    await this._requestSender.submitExtraFieldsToCart(
                        cartId,
                        {
                            ...(poNumber ? { poNumber } : {}),
                            ...(referenceNumber ? { referenceNumber } : {}),
                            extraFields: extraFields ?? [],
                            extraInfo: extraInfo ?? {},
                        },
                        b2bToken,
                        b2bBaseUrl,
                        options,
                    );

                    return createAction(B2BPreOrderActionType.PreOrderB2BMetadataSucceeded);
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(B2BPreOrderActionType.PreOrderB2BMetadataFailed, error),
                ),
            );
        };
    }
}
