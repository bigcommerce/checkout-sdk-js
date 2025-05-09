import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    BillingAddress,
    BillingAddressUpdateRequestBody,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GraphQLRequestOptions } from './graphql-request-options';

interface UpdateHeadlessBillingAddressResponse {
    data: {
        site: {
            checkout: {
                billingAddress: {
                    entityId: string;
                    address1: string;
                    address2: string;
                    city: string;
                    company: string;
                    countryCode: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    phone: string;
                    postalCode: string;
                    stateOrProvince: string;
                    stateOrProvinceCode: string;
                };
            };
        };
    };
}

export default class HeadlessWalletButtonIntegrationRequestService {
    constructor(private readonly requestSender: RequestSender) {}

    updateBillingAddress(
        checkoutId: string,
        address: BillingAddressUpdateRequestBody,
        options?: GraphQLRequestOptions,
    ): Promise<Response<BillingAddress>> {
        const path = 'wallet/graphql';

        const graphQLQuery = `
            mutation {
              checkout {
                updateCheckoutBillingAddress(
                  input: {
                    checkoutEntityId: ${checkoutId},
                    addressEntityId: ${address.id},
                    data: {
                        address: {
                            firstName: ${address.firstName},
                            lastName: ${address.lastName},
                            company: ${address.company},
                            address1: ${address.address1},
                            address2: ${address.address2},
                            city: ${address.city},
                            stateOrProvince: ${address.stateOrProvince},
                            stateOrProvinceCode: ${address.stateOrProvinceCode},
                            countryCode: ${address.countryCode},
                            postalCode: ${address.postalCode},
                            phone: ${address.phone},
                        }
                    }
                  }
                )
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
                query: graphQLQuery,
            },
        };

        return this.requestSender
            .post<UpdateHeadlessBillingAddressResponse>(
                `${window.location.origin}/${path}`,
                requestOptions,
            )
            .then(this.transformToBillingAddressResponse);
    }

    private transformToBillingAddressResponse(
        response: Response<UpdateHeadlessBillingAddressResponse>,
    ): Response<BillingAddress> {
        const {
            body: {
                data: {
                    site: {
                        checkout: { billingAddress },
                    },
                },
            },
        } = response;

        const { entityId, ...address } = billingAddress;

        return {
            ...response,
            body: {
                id: entityId,
                ...address,

                country: '',
                customFields: [],
            },
        };
    }
}
