import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Address } from '../address';
// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { Checkout, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import {
    B2BPostOrderActionType,
    PersistB2BMetadataAction,
    PersistB2BMetadataOptions,
} from './b2b-post-order-actions';
import B2BPostOrderRequestSender, { QuoteOrderedPayload } from './b2b-post-order-request-sender';

function mapToQuoteShippingAddress(
    address: Address,
): NonNullable<QuoteOrderedPayload['shippingAddress']> {
    return {
        country: address.country,
        state: address.stateOrProvince,
        city: address.city,
        zipCode: address.postalCode,
        address: address.address1,
        apartment: address.address2,
        firstName: address.firstName,
        lastName: address.lastName,
    };
}

function mapToQuoteOrderedPayload(
    checkout: Checkout,
    orderId: number,
    storeHash: string,
): QuoteOrderedPayload {
    const consignment = checkout.consignments[0];

    return {
        orderId,
        storeHash,
        shippingTotal: consignment ? checkout.shippingCostTotal : null,
        taxTotal: checkout.taxTotal,
        shippingMethod: consignment?.selectedShippingOption ?? null,
        shippingAddress: consignment
            ? mapToQuoteShippingAddress(consignment.shippingAddress)
            : null,
    };
}

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
            const isGuest = state.customer.getCustomer()?.isGuest ?? false;
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );
            const storeConfig = state.config.getStoreConfig();
            const quoteId = storeConfig?.checkoutSettings.capabilities?.userJourney.quoteConfig?.id;

            if (!orderId || !b2bBaseUrl || (!b2bToken && !isGuest)) {
                throw new MissingDataError(MissingDataErrorType.MissingOrder);
            }

            return concat(
                of(createAction(B2BPostOrderActionType.PersistB2BMetadataRequested)),
                defer(async () => {
                    let payload = { receiptId: '' };

                    if (isInvoice) {
                        if (!b2bToken) {
                            throw new MissingDataError(MissingDataErrorType.MissingOrder);
                        }

                        const { body } = await this._requestSender.submitInvoice(
                            { orderId: `${orderId}`, comment: invoiceComment ?? '' },
                            b2bToken,
                            b2bBaseUrl,
                        );

                        payload = { receiptId: body.data.receiptId };
                    } else {
                        if (b2bToken) {
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
                        }

                        if (typeof quoteId === 'number') {
                            const checkout = state.checkout.getCheckoutOrThrow();

                            await this._requestSender.submitQuote(
                                quoteId,
                                mapToQuoteOrderedPayload(
                                    checkout,
                                    orderId,
                                    storeConfig?.storeProfile.storeHash ?? '',
                                ),
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
