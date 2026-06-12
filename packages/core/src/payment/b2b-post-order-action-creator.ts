import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import {
    B2BPostOrderActionType,
    PersistB2BMetadataAction,
    PersistB2BMetadataOptions,
} from './b2b-post-order-actions';
import B2BPostOrderRequestSender from './b2b-post-order-request-sender';

export default class B2BPostOrderActionCreator {
    constructor(private _requestSender: B2BPostOrderRequestSender) {}

    persistB2BMetadata({
        isInvoice,
        invoiceComment,
        poNumber,
        referenceNumber,
        extraFields,
        extraInfo,
    }: PersistB2BMetadataOptions): ThunkAction<
        PersistB2BMetadataAction,
        InternalCheckoutSelectors
    > {
        return (store) => {
            const state = store.getState();
            const orderId = state.order.getOrderOrThrow().orderId;
            const b2bToken = state.b2bToken.getToken();
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );
            const storeConfig = state.config.getStoreConfig();
            const quoteId = storeConfig?.checkoutSettings.capabilities?.userJourney.quoteConfig?.id;

            if (!orderId || !b2bToken || !b2bBaseUrl) {
                throw new MissingDataError(MissingDataErrorType.MissingOrder);
            }

            return concat(
                of(createAction(B2BPostOrderActionType.PersistB2BMetadataRequested)),
                defer(async () => {
                    let payload = { receiptId: '' };

                    if (isInvoice) {
                        const { body } = await this._requestSender.submitInvoice(
                            { orderId: `${orderId}`, comment: invoiceComment ?? '' },
                            b2bToken,
                            b2bBaseUrl,
                        );

                        payload = { receiptId: body.data.receiptId };
                    } else {
                        await this._requestSender.submitOrderExtraFields(
                            {
                                orderId,
                                poNumber: poNumber ?? '',
                                referenceNumber: referenceNumber ?? '',
                                extraFields: extraFields ?? [],
                                extraInfo: extraInfo ?? {},
                            },
                            b2bToken,
                            b2bBaseUrl,
                        );

                        if (typeof quoteId === 'number') {
                            const checkout = state.checkout.getCheckoutOrThrow();
                            const consignment = checkout.consignments[0];

                            await this._requestSender.submitQuote(
                                quoteId,
                                {
                                    orderId,
                                    storeHash: storeConfig?.storeProfile.storeHash ?? '',
                                    shippingTotal: consignment ? checkout.shippingCostTotal : null,
                                    taxTotal: checkout.taxTotal,
                                    shippingMethod: consignment?.selectedShippingOption ?? null,
                                    shippingAddress: consignment
                                        ? {
                                              country: consignment.shippingAddress.country,
                                              state: consignment.shippingAddress.stateOrProvince,
                                              city: consignment.shippingAddress.city,
                                              zipCode: consignment.shippingAddress.postalCode,
                                              address: consignment.shippingAddress.address1,
                                              apartment: consignment.shippingAddress.address2,
                                              firstName: consignment.shippingAddress.firstName,
                                              lastName: consignment.shippingAddress.lastName,
                                          }
                                        : null,
                                },
                                b2bToken,
                                b2bBaseUrl,
                            );
                        }
                    }

                    return createAction(
                        B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                        payload,
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(B2BPostOrderActionType.PersistB2BMetadataFailed, error),
                ),
            );
        };
    }
}
