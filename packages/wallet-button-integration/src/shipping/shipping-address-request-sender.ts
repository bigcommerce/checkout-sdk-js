import { RequestSender } from '@bigcommerce/request-sender';

import { AddressRequestBody } from '../billing/billing-address';
import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    SelectCheckoutShippingOptionResponseBody,
    ShippingAddressUpdateOptions,
    ShippingAddressUpdateResult,
    ShippingCheckoutData,
    UpdateCheckoutShippingAddressResponseBody,
} from './shipping-address';

const SHIPPING_CHECKOUT_FIELDS = `
    currencyCode
    outstandingBalance {
        value
    }
    shippingConsignments {
        entityId
        selectedShippingOption {
            entityId
        }
        availableShippingOptions {
            entityId
            description
            isRecommended
            transitTime
            cost {
                value
                formattedV2
            }
        }
    }
`;

export default class ShippingAddressRequestSender {
    constructor(private readonly requestSender: RequestSender) {}

    async updateShippingAddress(
        graphQLEndpoint: string,
        checkoutId: string,
        address: AddressRequestBody,
        options?: ShippingAddressUpdateOptions,
    ): Promise<ShippingAddressUpdateResult | undefined> {
        const { consignmentEntityId, lineItems, ...requestOptions } = options ?? {};
        const requestUrl = `${window.location.origin}/${graphQLEndpoint}`;
        const headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json',
            'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
        };

        const shippingLineItems = lineItems?.filter(({ isShippingRequired }) => isShippingRequired);

        if (!shippingLineItems?.length) {
            return;
        }

        const checkoutLineItems = shippingLineItems.map(({ entityId, quantity }) => ({
            lineItemEntityId: entityId,
            quantity,
        }));

        const updateResponse =
            await this.requestSender.post<UpdateCheckoutShippingAddressResponseBody>(requestUrl, {
                ...requestOptions,
                headers,
                body: {
                    query: `
                        mutation UpdateCheckoutShippingAddressMutation($input: UpdateCheckoutInput!) {
                            checkout {
                                updateCheckout(input: $input) {
                                    checkout {
                                        ${SHIPPING_CHECKOUT_FIELDS}
                                    }
                                    errors {
                                        __typename
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            checkoutEntityId: checkoutId,
                            data: {
                                shippingConsignments: [
                                    {
                                        ...(consignmentEntityId && {
                                            entityId: consignmentEntityId,
                                        }),
                                        address,
                                        lineItems: checkoutLineItems,
                                    },
                                ],
                            },
                        },
                    },
                },
            });

        const updateResult = updateResponse.body.data.checkout?.updateCheckout;

        if (!updateResult || updateResult.errors.length > 0) {
            throw new Error('Failed to update checkout shipping address.');
        }

        return this.mapShippingCheckout(updateResult.checkout);
    }

    async selectShippingOption(
        graphQLEndpoint: string,
        checkoutId: string,
        consignmentEntityId: string,
        shippingOptionEntityId: string,
        options?: GraphQLRequestOptions,
    ): Promise<ShippingAddressUpdateResult> {
        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
                'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
            },
            body: {
                query: `
                    mutation SelectCheckoutShippingOptionMutation(
                        $input: SelectCheckoutShippingOptionInput!
                    ) {
                        checkout {
                            selectCheckoutShippingOption(input: $input) {
                                checkout {
                                    ${SHIPPING_CHECKOUT_FIELDS}
                                }
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        checkoutEntityId: checkoutId,
                        consignmentEntityId,
                        data: { shippingOptionEntityId },
                    },
                },
            },
        };

        const response = await this.requestSender.post<SelectCheckoutShippingOptionResponseBody>(
            `${window.location.origin}/${graphQLEndpoint}`,
            requestOptions,
        );

        return this.mapShippingCheckout(
            response.body.data.checkout?.selectCheckoutShippingOption?.checkout,
        );
    }

    private mapShippingCheckout(
        checkout?: ShippingCheckoutData | null,
    ): ShippingAddressUpdateResult {
        const consignment = checkout?.shippingConsignments?.[0];
        const totalPrice = checkout?.outstandingBalance?.value;

        if (!checkout || !consignment || totalPrice === undefined) {
            throw new Error('Failed to retrieve checkout shipping options.');
        }

        return {
            consignmentEntityId: consignment.entityId,
            availableShippingOptions: consignment.availableShippingOptions ?? [],
            selectedShippingOptionEntityId: consignment.selectedShippingOption?.entityId,
            currencyCode: checkout.currencyCode,
            totalPrice: String(totalPrice),
        };
    }
}
