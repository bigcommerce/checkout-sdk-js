import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Address, isAddressEqual } from '../address';
// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { BillingAddress } from '../billing';
import { Checkout, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { Consignment } from '../shipping';

import {
    B2BPostOrderActionType,
    PersistB2BMetadataAction,
    PersistB2BMetadataOptions,
} from './b2b-post-order-actions';
import B2BPostOrderRequestSender, {
    AddOrderExtraFieldsPayload,
    B2BExtraField,
    CreateCompanyAddressPayload,
    QuoteOrderedPayload,
} from './b2b-post-order-request-sender';

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

type CompanyAddressExtraFields = NonNullable<
    AddOrderExtraFieldsPayload['extraInfo']['addressExtraFields']
>;

function mapToCompanyAddress(
    address: Address,
    flags: Pick<CreateCompanyAddressPayload, 'isBilling' | 'isShipping'>,
    extraFields: B2BExtraField[],
): CreateCompanyAddressPayload {
    return {
        addressLine1: address.address1,
        addressLine2: address.address2,
        city: address.city,
        label: address.label ?? '',
        firstName: address.firstName,
        lastName: address.lastName,
        phoneNumber: address.phone,
        zipCode: address.postalCode,
        country: {
            countryCode: address.countryCode,
            countryName: address.country,
        },
        state: {
            stateCode: address.stateOrProvinceCode,
            stateName: address.stateOrProvince,
        },
        isBilling: flags.isBilling,
        isCheckout: true,
        isShipping: flags.isShipping,
        extraFields,
    };
}

function buildCompanyAddresses(
    billingAddress: BillingAddress | undefined,
    consignments: Consignment[] | undefined,
    addressExtraFields: CompanyAddressExtraFields | undefined,
): CreateCompanyAddressPayload[] {
    const savedAddresses: Array<{
        rawAddress: Address;
        mappedAddress: CreateCompanyAddressPayload;
    }> = [];

    if (billingAddress?.shouldSaveAddress) {
        savedAddresses.push({
            rawAddress: billingAddress,
            mappedAddress: mapToCompanyAddress(
                billingAddress,
                { isBilling: 1, isShipping: 0 },
                addressExtraFields?.billingAddressExtraFields ?? [],
            ),
        });
    }

    (consignments ?? []).forEach((consignment) => {
        const { shippingAddress } = consignment;

        if (!shippingAddress?.shouldSaveAddress) {
            return;
        }

        const savedAddress = savedAddresses.find(({ rawAddress }) =>
            isAddressEqual(rawAddress, shippingAddress),
        );

        if (savedAddress) {
            savedAddress.mappedAddress.isShipping = 1;

            return;
        }

        savedAddresses.push({
            rawAddress: shippingAddress,
            mappedAddress: mapToCompanyAddress(
                shippingAddress,
                { isBilling: 0, isShipping: 1 },
                addressExtraFields?.shippingAddressExtraFields ?? [],
            ),
        });
    });

    return savedAddresses.map(({ mappedAddress }) => mappedAddress);
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
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );
            const companyId = state.cart.getCart()?.companyId;
            const storeConfig = state.config.getStoreConfig();
            const quoteId = storeConfig?.checkoutSettings.capabilities?.userJourney.quoteConfig?.id;
            const companyAddresses = buildCompanyAddresses(
                state.billingAddress.getBillingAddress(),
                state.consignments.getConsignments(),
                extraInfo?.addressExtraFields,
            );

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
                        if (companyId && companyAddresses.length) {
                            await Promise.all(
                                companyAddresses.map((companyAddress) =>
                                    this._requestSender.submitCompanyAddress(
                                        companyId,
                                        companyAddress,
                                        b2bToken,
                                        b2bBaseUrl,
                                    ),
                                ),
                            );
                        }

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
