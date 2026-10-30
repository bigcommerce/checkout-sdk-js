import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { AddressRequestBody } from '../billing/billing-address';
import { GraphQLRequestOptions } from '../graphql-request-options';

import ShippingAddressRequestSender from './shipping-address-request-sender';

describe('ShippingAddressRequestSender', () => {
    let requestSender: RequestSender;
    let shippingAddressRequestSender: ShippingAddressRequestSender;

    const graphQLEndpoint = 'graphql';
    const checkoutId = 'checkout-id-123';
    const address: AddressRequestBody = {
        firstName: 'John',
        lastName: 'Doe',
        company: '',
        address1: '123 Main St',
        address2: 'Suite 2',
        city: 'Austin',
        email: 'john@example.com',
        stateOrProvince: 'Texas',
        stateOrProvinceCode: 'TX',
        countryCode: 'US',
        postalCode: '78701',
        phone: '555-555-5555',
        shouldSaveAddress: false,
    };

    const response = (body: unknown) => ({
        body,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
    });
    const updatedCheckout = {
        currencyCode: 'USD',
        outstandingBalance: { value: 225 },
        shippingConsignments: [
            {
                entityId: 'consignment-1',
                selectedShippingOption: { entityId: 'rate-1' },
                availableShippingOptions: [
                    {
                        entityId: 'rate-1',
                        description: 'Flat rate',
                        isRecommended: true,
                        transitTime: '2 days',
                        cost: { value: '2.50', formattedV2: '$2.50' },
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        requestSender = createRequestSender();
        shippingAddressRequestSender = new ShippingAddressRequestSender(requestSender);
    });

    it('sends only schema-supported fields for cart line items', async () => {
        const cartLineItem = {
            entityId: 'physical-1',
            quantity: 2,
            isShippingRequired: true,
        };
        const postSpy = jest.spyOn(requestSender, 'post').mockResolvedValueOnce(
            response({
                data: {
                    checkout: {
                        updateCheckout: { errors: [], checkout: updatedCheckout },
                    },
                },
            }),
        );
        const options: GraphQLRequestOptions = { headers: { 'X-Test': '1' } };

        const result = await shippingAddressRequestSender.updateShippingAddress(
            graphQLEndpoint,
            checkoutId,
            address,
            {
                ...options,
                consignmentEntityId: 'consignment-1',
                lineItems: [
                    cartLineItem,
                    { entityId: 'physical-2', quantity: 1, isShippingRequired: true },
                    { entityId: 'digital-1', quantity: 1 },
                ],
            },
        );

        expect(postSpy).toHaveBeenCalledTimes(1);
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

        const requestCall = postSpy.mock.calls[0];

        if (!requestCall) {
            throw new Error('Expected a shipping address update request.');
        }

        const requestOptions = requestCall[1];

        if (!requestOptions) {
            throw new Error('Expected shipping address update request options.');
        }

        const requestBody = JSON.stringify(requestOptions.body);

        expect(requestBody).toContain(
            '"lineItems":[{"lineItemEntityId":"physical-1","quantity":2},{"lineItemEntityId":"physical-2","quantity":1}]',
        );
        expect(requestBody).not.toContain('digital-1');
        expect(requestBody).toContain('"entityId":"consignment-1"');
        expect(requestBody).toContain('availableShippingOptions');
        expect(requestBody).toContain('outstandingBalance');
        expect(requestBody).not.toContain('Able Brewing System');
        expect(requestBody).not.toContain('image.jpg');
        expect(result).toEqual({
            consignmentEntityId: 'consignment-1',
            availableShippingOptions:
                updatedCheckout.shippingConsignments[0].availableShippingOptions,
            selectedShippingOptionEntityId: 'rate-1',
            currencyCode: 'USD',
            totalPrice: '225',
        });
    });

    it('selects a shipping option and returns the updated checkout', async () => {
        const postSpy = jest.spyOn(requestSender, 'post').mockResolvedValueOnce(
            response({
                data: {
                    checkout: {
                        selectCheckoutShippingOption: { checkout: updatedCheckout },
                    },
                },
            }),
        );

        const result = await shippingAddressRequestSender.selectShippingOption(
            graphQLEndpoint,
            checkoutId,
            'consignment-1',
            'rate-1',
        );

        expect(JSON.stringify(postSpy.mock.calls[0]?.[1]?.body)).toContain(
            '"data":{"shippingOptionEntityId":"rate-1"}',
        );
        expect(result.selectedShippingOptionEntityId).toBe('rate-1');
        expect(result.totalPrice).toBe('225');
    });

    it('does not send an update when no shippable line items are provided', async () => {
        const postSpy = jest.spyOn(requestSender, 'post');

        await shippingAddressRequestSender.updateShippingAddress(
            graphQLEndpoint,
            checkoutId,
            address,
        );

        expect(postSpy).not.toHaveBeenCalled();
    });

    it('does not send an update when every line item is non-shippable', async () => {
        const postSpy = jest.spyOn(requestSender, 'post');

        await expect(
            shippingAddressRequestSender.updateShippingAddress(
                graphQLEndpoint,
                checkoutId,
                address,
                { lineItems: [{ entityId: 'digital-1', quantity: 1 }] },
            ),
        ).resolves.toBeUndefined();

        expect(postSpy).not.toHaveBeenCalled();
    });

    it('throws when checkout shipping update returns errors', async () => {
        jest.spyOn(requestSender, 'post').mockResolvedValueOnce(
            response({
                data: {
                    checkout: {
                        updateCheckout: {
                            errors: [{ __typename: 'CheckoutShippingConsignmentError' }],
                        },
                    },
                },
            }),
        );

        await expect(
            shippingAddressRequestSender.updateShippingAddress(
                graphQLEndpoint,
                checkoutId,
                address,
                {
                    lineItems: [{ entityId: 'physical-1', quantity: 1, isShippingRequired: true }],
                },
            ),
        ).rejects.toThrow('Failed to update checkout shipping address.');
    });
});
