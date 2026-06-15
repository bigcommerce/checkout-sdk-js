import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    AddBillingAddressResponseBody,
    AddressRequestBody,
    BillingAddressResponse,
    BillingAddressUpdateRequestBody,
    UpdateBillingAddressResponseBody,
} from './billing-address';
import BillingAddressRequestSender from './billing-address-request-sender';

describe('BillingAddressRequestSender', () => {
    let requestSender: RequestSender;
    let billingAddressRequestSender: BillingAddressRequestSender;
    const graphQLEndpoint = 'graphql';
    const checkoutId = 'checkout-123';
    const address: AddressRequestBody = {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Bigcommerce',
        address1: '123 Main St',
        address2: '',
        city: 'Austin',
        email: 'john@doe.com',
        stateOrProvince: 'Texas',
        stateOrProvinceCode: 'TX',
        countryCode: 'US',
        postalCode: '78701',
        phone: '555-555-5555',
        shouldSaveAddress: false,
    };
    const updateBillingAddressRequestBody: BillingAddressUpdateRequestBody = {
        ...address,
        id: 'address-1',
    };

    const billingAddressResponse: BillingAddressResponse = {
        ...updateBillingAddressRequestBody,
        entityId: 'entity-1',
    };

    const updateResponseBody: UpdateBillingAddressResponseBody = {
        data: {
            checkout: {
                updateCheckoutBillingAddress: {
                    checkout: {
                        billingAddress: billingAddressResponse,
                    },
                },
            },
        },
    };

    const addResponseBody: AddBillingAddressResponseBody = {
        data: {
            checkout: {
                addCheckoutBillingAddress: {
                    checkout: {
                        billingAddress: billingAddressResponse,
                    },
                },
            },
        },
    };

    beforeEach(() => {
        requestSender = createRequestSender();

        billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
    });

    describe('#updateBillingAddress', () => {
        it('sends a POST request with correct GraphQL mutation and variables', async () => {
            const postSpy = jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: updateResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const options: GraphQLRequestOptions = { headers: { 'X-Test': '1' } };
            const result = await billingAddressRequestSender.updateBillingAddress(
                graphQLEndpoint,
                checkoutId,
                updateBillingAddressRequestBody,
                options,
            );

            expect(postSpy).toHaveBeenCalledWith(
                `${window.location.origin}/${graphQLEndpoint}`,
                expect.objectContaining({
                    headers: {
                        'X-Test': '1',
                        'Content-Type': 'application/json',
                        'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
                    },
                }),
            );

            expect(postSpy.mock.calls[0][1]).toMatchObject({
                body: {
                    variables: {
                        input: {
                            checkoutEntityId: checkoutId,
                            addressEntityId: updateBillingAddressRequestBody.id,
                        },
                    },
                },
            });
            expect(result.body).toEqual(billingAddressResponse);
        });
    });

    describe('#addBillingAddress', () => {
        it('sends a POST request with correct GraphQL mutation and variables', async () => {
            const postSpy = jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: addResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const options: GraphQLRequestOptions = { headers: { 'X-Test': '2' } };
            const result = await billingAddressRequestSender.addBillingAddress(
                graphQLEndpoint,
                checkoutId,
                address,
                options,
            );

            expect(postSpy).toHaveBeenCalledWith(
                `${window.location.origin}/${graphQLEndpoint}`,
                expect.objectContaining({
                    headers: {
                        'X-Test': '2',
                        'Content-Type': 'application/json',
                        'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
                    },
                }),
            );

            expect(postSpy.mock.calls[0][1]).toMatchObject({
                body: {
                    variables: {
                        input: {
                            checkoutEntityId: checkoutId,
                            data: { address },
                        },
                    },
                },
            });
            expect(result.body).toEqual(billingAddressResponse);
        });
    });
});
