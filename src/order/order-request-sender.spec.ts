import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import { InternalOrderResponseBody } from './internal-order-responses';
import { getCompleteOrderResponseBody } from './internal-orders.mock';
import Order from './order';
import { OrderIncludes } from './order-params';
import OrderRequestSender from './order-request-sender';
import { getOrder } from './orders.mock';

describe('OrderRequestSender', () => {
    let orderRequestSender: OrderRequestSender;
    const include = [
        'payments',
        'lineItems.physicalItems.socialMedia',
        'lineItems.physicalItems.options',
        'lineItems.digitalItems.socialMedia',
        'lineItems.digitalItems.options',
    ].join(',');

    const requestSender = createRequestSender();

    beforeEach(() => {
        orderRequestSender = new OrderRequestSender(requestSender);
    });

    describe('#loadOrder()', () => {
        let response: Response<Order>;

        beforeEach(() => {
            response = getResponse(getOrder());
            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads order', async () => {
            const output = await orderRequestSender.loadOrder(295);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/orders/295', {
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
                params: { include },
                timeout: undefined,
            });
        });

        it('loads order with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.loadOrder(295, options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/orders/295', {
                ...options,
                params: { include },
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads order including payment data', async () => {
            await orderRequestSender.loadOrder(295);

            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/orders/295', {
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
                params: { include },
                timeout: undefined,
            });
        });

        it('loads order including item categories', async () => {
            const categoryIncludes = [OrderIncludes.PhysicalItemsCategories,
                OrderIncludes.DigitalItemsCategories].join(',');
            await orderRequestSender.loadOrder(295, { params: { include: [OrderIncludes.PhysicalItemsCategories,
                        OrderIncludes.DigitalItemsCategories]} });
            const expectedInclude = include + ',' + categoryIncludes;

            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/orders/295', {
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
                params: { include: expectedInclude },
                timeout: undefined,
            });
        });
    });

    describe('#submitOrder()', () => {
        let response: Response<InternalOrderResponseBody>;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('submits order and returns response', async () => {
            const payload = { useStoreCredit: false };
            const output = await orderRequestSender.submitOrder(payload);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', expect.objectContaining({
                body: payload,
                headers: expect.anything(),
            }));
        });

        it('submits order and returns response with timeout', async () => {
            const payload = { useStoreCredit: false };
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.submitOrder(payload, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', expect.objectContaining({
                ...options,
                body: payload,
            }));
        });

        it('submits order with checkout variant header and library version when variant is provided', async () => {
            const payload = {};
            const headers = {
                checkoutVariant: 'default',
                ...SDK_VERSION_HEADERS,
            };

            await orderRequestSender.submitOrder(payload, { headers });

            expect(requestSender.post)
                .toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
                    body: payload,
                    headers: {
                        'X-Checkout-Variant': headers.checkoutVariant,
                        'X-Checkout-SDK-Version': expect.any(String),
                    },
                });
        });

        it('submits order with library version', async () => {
            const payload = {};

            await orderRequestSender.submitOrder(payload);

            expect(requestSender.post)
                .toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
                    body: payload,
                    headers: {
                        'X-Checkout-SDK-Version': expect.any(String),
                    },
                });
        });
    });

    describe('#finalizeOrder()', () => {
        let response: Response<InternalOrderResponseBody>;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('finalizes order and returns response', async () => {
            const output = await orderRequestSender.finalizeOrder(295);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', {
                timeout: undefined,
                headers: SDK_VERSION_HEADERS,
            });
        });

        it('finalizes order and returns response with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.finalizeOrder(295, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', {
                ...options,
                headers: SDK_VERSION_HEADERS,
            });
        });
    });
});
