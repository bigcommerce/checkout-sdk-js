import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import CartRequestSender from './cart-request-sender';
import { getCartResponseBody } from './internal-carts.mock';

describe('CartRequestSender', () => {
    let cartRequestSender: CartRequestSender;
    let response: Response;
    let requestSender: RequestSender;

    beforeEach(() => {
        response = getResponse(getCartResponseBody());
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'get').mockResolvedValue(response);

        cartRequestSender = new CartRequestSender(requestSender);
    });

    describe('#loadCart()', () => {
        it('sends request to load cart', async () => {
            const output = await cartRequestSender.loadCart();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/cart', { timeout: undefined });
        });

        it('sends request to load cart with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await cartRequestSender.loadCart(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/cart', options);
        });
    });
});
