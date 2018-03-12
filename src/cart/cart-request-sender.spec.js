import { createTimeout } from '@bigcommerce/request-sender';
import { getCartResponseBody } from './internal-carts.mock';
import { getResponse } from '../common/http-request/responses.mock';
import CartRequestSender from './cart-request-sender';

describe('CartRequestSender', () => {
    let cartRequestSender;
    let response;
    let requestSender;

    beforeEach(() => {
        response = getResponse(getCartResponseBody());

        requestSender = {
            get: jest.fn(() => Promise.resolve(response)),
        };

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
