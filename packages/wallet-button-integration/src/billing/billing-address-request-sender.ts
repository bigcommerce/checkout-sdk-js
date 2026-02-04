import { RequestSender, Response } from '@bigcommerce/request-sender';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    AddressRequestBody,
    BillingAddressResponse,
    BillingAddressResponseBody,
    BillingAddressUpdateRequestBody,
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
            },
            body: {
                ...options?.body,
                document,
                variables: JSON.stringify({
                    input: {
                        checkoutEntityId: checkoutId,
                        addressEntityId: address.id,
                        data: {
                            address: {
                                ...billingAddressFields,
                            },
                        },
                    },
                }),
            },
        };

        const response = await this.requestSender.post<BillingAddressResponseBody>(
            `${window.location.origin}/${graphQLEndpoint}`,
            requestOptions,
        );

        return this.transformToBillingAddressResponse(response);
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
            },
            body: {
                ...options?.body,
                document,
                variables: JSON.stringify({
                    input: {
                        checkoutEntityId: checkoutId,
                        data: {
                            address: {
                                ...address,
                            },
                        },
                    },
                }),
            },
        };

        const response = await this.requestSender.post<BillingAddressResponseBody>(
            `${window.location.origin}/${graphQLEndpoint}`,
            requestOptions,
        );

        return this.transformToBillingAddressResponse(response);
    }

    private transformToBillingAddressResponse(
        response: Response<BillingAddressResponseBody>,
    ): Response<BillingAddressResponse> {
        const {
            body: {
                data: {
                    site: {
                        checkout: { billingAddress },
                    },
                },
            },
        } = response;

        return {
            ...response,
            body: billingAddress,
        };
    }
}
