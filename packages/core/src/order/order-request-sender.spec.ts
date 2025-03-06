import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';

import { CartConsistencyError } from '../cart/errors';
import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { MissingShippingMethodError, OrderTaxProviderUnavailableError } from './errors';
import { InternalOrderResponseBody } from './internal-order-responses';
import { getCompleteOrderResponseBody } from './internal-orders.mock';
import Order from './order';
import OrderRequestSender from './order-request-sender';
import { getOrder } from './orders.mock';

describe('OrderRequestSender', () => {
    let orderRequestSender: OrderRequestSender;
    const include = [
        'payments',
        'lineItems.physicalItems.socialMedia',
        'lineItems.physicalItems.options',
        'lineItems.physicalItems.categories',
        'lineItems.digitalItems.socialMedia',
        'lineItems.digitalItems.options',
        'lineItems.digitalItems.categories',
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
    });

    describe('#submitOrder()', () => {
        let response: Response<InternalOrderResponseBody>;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('submits order and returns response', async () => {
            const payload = {
                cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                useStoreCredit: false,
            };
            const output = await orderRequestSender.submitOrder(payload);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith(
                '/internalapi/v1/checkout/order',
                expect.objectContaining({
                    body: payload,
                    headers: expect.anything(),
                }),
            );
        });

        it('throws OrderTaxProviderUnavailableError if request status is 500 and type is tax_provider_unavailable', async () => {
            const error = getErrorResponse(
                {
                    status: 500,
                    title: 'The tax provider is unavailable.',
                    type: 'tax_provider_unavailable',
                },
                undefined,
                500,
            );

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.reject(error));

            try {
                const payload = {
                    cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    useStoreCredit: false,
                };

                await orderRequestSender.submitOrder(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(OrderTaxProviderUnavailableError);
            }
        });

        it('throws `CartConsistencyError` if error type is `cart_has_changed`', async () => {
            const error = getErrorResponse(
                {
                    status: 409,
                    title: 'Checkout could not be processed',
                    type: 'cart_has_changed',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.reject(error));

            try {
                const payload = {
                    cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    useStoreCredit: false,
                };

                await orderRequestSender.submitOrder(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(CartConsistencyError);
            }
        });

        it('throws `MissingShippingMethodError` if error type is `missing_shipping_method`', async () => {
            const error = getErrorResponse(
                {
                    status: 400,
                    title: 'Missing shipping method',
                    type: 'missing_shipping_method',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.reject(error));

            try {
                const payload = {
                    cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    useStoreCredit: false,
                };

                await orderRequestSender.submitOrder(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingShippingMethodError);
            }
        });

        it('submits order and returns response with timeout', async () => {
            const payload = {
                cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                useStoreCredit: false,
            };
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.submitOrder(payload, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith(
                '/internalapi/v1/checkout/order',
                expect.objectContaining({
                    ...options,
                    body: payload,
                }),
            );
        });

        it('submits order with checkout variant header and library version when variant is provided', async () => {
            const payload = { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' };
            const headers = {
                checkoutVariant: 'default',
                ...SDK_VERSION_HEADERS,
            };

            await orderRequestSender.submitOrder(payload, { headers });

            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
                body: payload,
                headers: {
                    'X-Checkout-Variant': headers.checkoutVariant,
                    'X-Checkout-SDK-Version': expect.any(String),
                },
            });
        });

        it('submits order with library version', async () => {
            const payload = { cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' };

            await orderRequestSender.submitOrder(payload);

            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
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
