import { getCompleteOrderResponseBody } from './orders.mock';
import { getResponse } from '../../http-request/responses.mock';
import { createTimeout } from '../../http-request';
import OrderRequestSender from './order-request-sender';

describe('OrderRequestSender', () => {
    let orderRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            get: jest.fn(() => Promise.resolve()),
            post: jest.fn(() => Promise.resolve()),
        };

        orderRequestSender = new OrderRequestSender(requestSender);
    });

    describe('#loadOrder()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());

            requestSender.get.mockReturnValue(Promise.resolve(response));
        });

        it('loads order', async () => {
            const output = await orderRequestSender.loadOrder(295);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', { timeout: undefined });
        });

        it('loads order with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.loadOrder(295, options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', options);
        });
    });

    describe('#submitOrder()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));
        });

        it('submits order and returns response', async () => {
            const payload = { useStoreCredit: false };
            const output = await orderRequestSender.submitOrder(payload);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
                body: payload,
            });
        });

        it('submits order and returns response with timeout', async () => {
            const payload = { useStoreCredit: false };
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.submitOrder(payload, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
                ...options,
                body: payload,
            });
        });
    });

    describe('#finalizeOrder()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));
        });

        it('finalizes order and returns response', async () => {
            const output = await orderRequestSender.finalizeOrder(295);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', { timeout: undefined });
        });

        it('finalizes order and returns response with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await orderRequestSender.finalizeOrder(295, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', options);
        });
    });
});
