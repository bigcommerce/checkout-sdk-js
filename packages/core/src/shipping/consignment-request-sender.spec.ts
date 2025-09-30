import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';

import { EmptyCartError } from '../cart/errors';
import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getErrorResponse } from '../common/http-request/responses.mock';

import ConsignmentRequestSender from './consignment-request-sender';
import { getConsignmentRequestBody } from './consignments.mock';

describe('ConsignmentRequestSender', () => {
    let consignmentRequestSender: ConsignmentRequestSender;
    const requestSender = createRequestSender();

    const checkoutId = 'foo';
    const consignment = getConsignmentRequestBody();
    const consignments = [
        {
            // tslint:disable-next-line:no-non-null-assertion
            address: consignment.address!,
            // tslint:disable-next-line:no-non-null-assertion
            shippingAddress: consignment.shippingAddress!,
            // tslint:disable-next-line:no-non-null-assertion
            lineItems: consignment.lineItems!,
        },
    ];
    const options = { timeout: createTimeout() };
    const shippingInclude = 'consignments.availableShippingOptions';
    const baseInclude = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(',');
    const include = [shippingInclude, baseInclude].join(',');

    beforeEach(() => {
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve({ body: getCheckout() }));
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'put').mockReturnValue(Promise.resolve({ body: getCheckout() }));
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'delete').mockReturnValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Promise.resolve({ body: getCheckout() }),
        );

        consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    });

    describe('#createConsignments()', () => {
        it('creates consignments', async () => {
            await consignmentRequestSender.createConsignments(checkoutId, consignments);

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/foo/consignments',
                {
                    body: consignments,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include,
                    },
                },
            );
        });

        it('creates consignments with timeout', async () => {
            await consignmentRequestSender.createConsignments(checkoutId, consignments, options);

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/foo/consignments',
                {
                    ...options,
                    body: consignments,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include,
                    },
                },
            );
        });

        it('creates consignments without including shipping options', async () => {
            await consignmentRequestSender.createConsignments(checkoutId, consignments, {
                ...options,
                params: {
                    include: {
                        'consignments.availableShippingOptions': false,
                    },
                },
            });

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/foo/consignments',
                {
                    ...options,
                    body: consignments,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include: baseInclude,
                    },
                },
            );
        });

        it('throws `EmptyCartError` if error type is `empty_cart`', async () => {
            const error = getErrorResponse(
                {
                    status: 422,
                    title: 'The request could not process',
                    type: 'empty_cart',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.reject(error));

            await expect(
                consignmentRequestSender.createConsignments(checkoutId, consignments, {
                    ...options,
                    params: {
                        include: {
                            'consignments.availableShippingOptions': false,
                        },
                    },
                }),
            ).rejects.toThrow(EmptyCartError);
        });
    });

    describe('#updateConsignment()', () => {
        const { id, ...body } = consignment;

        it('updates a consignment', async () => {
            await consignmentRequestSender.updateConsignment(checkoutId, consignment);

            expect(requestSender.put).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/consignments/${id}`,
                {
                    body,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include,
                    },
                },
            );
        });

        it('updates a consignment with timeout', async () => {
            await consignmentRequestSender.updateConsignment(checkoutId, consignment, options);

            expect(requestSender.put).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/consignments/${id}`,
                {
                    ...options,
                    body,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include,
                    },
                },
            );
        });

        it('updates a consignment without requesting shipping options', async () => {
            await consignmentRequestSender.updateConsignment(checkoutId, consignment, {
                ...options,
                params: {
                    include: {
                        'consignments.availableShippingOptions': false,
                    },
                },
            });

            expect(requestSender.put).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/consignments/${id}`,
                {
                    ...options,
                    body,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include: baseInclude,
                    },
                },
            );
        });

        it('throws `EmptyCartError` if error type is `empty_cart`', async () => {
            const error = getErrorResponse(
                {
                    status: 422,
                    title: 'The request could not process',
                    type: 'empty_cart',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'put').mockReturnValue(Promise.reject(error));

            await expect(
                consignmentRequestSender.updateConsignment(checkoutId, consignment, {
                    ...options,
                    params: {
                        include: {
                            'consignments.availableShippingOptions': false,
                        },
                    },
                }),
            ).rejects.toThrow(EmptyCartError);
        });
    });

    describe('#deleteConsignment()', () => {
        it('deletes a consignment', async () => {
            await consignmentRequestSender.deleteConsignment(checkoutId, consignment.id);

            expect(requestSender.delete).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/consignments/${consignment.id}`,
                {
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include,
                    },
                },
            );
        });

        it('deletes a consignment with timeout', async () => {
            await consignmentRequestSender.deleteConsignment(checkoutId, consignment.id, options);

            expect(requestSender.delete).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/consignments/${consignment.id}`,
                {
                    ...options,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include,
                    },
                },
            );
        });

        it('throws `EmptyCartError` if error type is `empty_cart`', async () => {
            const error = getErrorResponse(
                {
                    status: 422,
                    title: 'The request could not process',
                    type: 'empty_cart',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.reject(error));

            await expect(
                consignmentRequestSender.deleteConsignment(checkoutId, consignment.id, {
                    ...options,
                    params: {
                        include: {
                            'consignments.availableShippingOptions': false,
                        },
                    },
                }),
            ).rejects.toThrow(EmptyCartError);
        });
    });
});
