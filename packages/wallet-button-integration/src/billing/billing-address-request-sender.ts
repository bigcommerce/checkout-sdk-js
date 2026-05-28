import { RequestSender, Response } from '@bigcommerce/request-sender';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    AddBillingAddressResponseBody,
    AddressRequestBody,
    BillingAddressResponse,
    BillingAddressUpdateRequestBody,
    UpdateBillingAddressResponseBody,
} from './billing-address';

export default class BillingAddressRequestSender {
    constructor(private readonly requestSender: RequestSender) {}

    async updateBillingAddress(
        graphQLEndpoint: string,
        checkoutId: string,
        address: BillingAddressUpdateRequestBody,
        options?: GraphQLRequestOptions,
    ): Promise<Response<BillingAddressResponse>> {
        const document = `
            mutation UpdateCheckoutBillingAddressMutation(
                $input: UpdateCheckoutBillingAddressInput!
            ) {
                checkout {
                    updateCheckoutBillingAddress(input: $input) {
                        checkout {
                            billingAddress {
                                address1
                                address2
                                city
                                company
                                countryCode
                                email
                                entityId
                                firstName
                                lastName
                                phone
                                postalCode
                                stateOrProvince
                                stateOrProvinceCode
                            }
                        }
                    }
                }
            }
        `;

        const { id, ...billingAddressFields } = address;

        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
                'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
            },
            body: {
                query: document,
                variables: {
                    input: {
                        checkoutEntityId: checkoutId,
                        addressEntityId: address.id,
                        data: {
                            address: {
                                ...billingAddressFields,
                            },
                        },
                    },
                },
            },
        };

        const response = await this.requestSender.post<UpdateBillingAddressResponseBody>(
            `${window.location.origin}/${graphQLEndpoint}`,
            requestOptions,
        );

        const { billingAddress } =
            response.body.data.checkout.updateCheckoutBillingAddress.checkout;

        return {
            ...response,
            body: billingAddress,
        };
    }

    async addBillingAddress(
        graphQLEndpoint: string,
        checkoutId: string,
        address: AddressRequestBody,
        options?: GraphQLRequestOptions,
    ): Promise<Response<BillingAddressResponse>> {
        const document = `
            mutation AddCheckoutBillingAddressMutation(
                $input: AddCheckoutBillingAddressInput!
            ) {
                checkout {
                    addCheckoutBillingAddress(input: $input) {
                        checkout {
                            billingAddress {
                                address1
                                address2
                                city
                                company
                                countryCode
                                email
                                entityId
                                firstName
                                lastName
                                phone
                                postalCode
                                stateOrProvince
                                stateOrProvinceCode
                            }
                        }
                    }
                }
            }
        `;

        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
                'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
            },
            body: {
                query: document,
                variables: {
                    input: {
                        checkoutEntityId: checkoutId,
                        data: {
                            address: {
                                ...address,
                            },
                        },
                    },
                },
            },
        };

        const response = await this.requestSender.post<AddBillingAddressResponseBody>(
            `${window.location.origin}/${graphQLEndpoint}`,
            requestOptions,
        );

        const { billingAddress } = response.body.data.checkout.addCheckoutBillingAddress.checkout;

        return {
            ...response,
            body: billingAddress,
        };
    }
}
