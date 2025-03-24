import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import BuyNowCartRequestBody from './buy-now-cart-request-body';
import Cart from './cart';
import CartRequestSender from './cart-request-sender';
import { getCart } from './carts.mock';
import { HeadlessCartRequestResponse } from './headless-cart';
import { getHeadlessCartResponse } from './headless-cart/mocks/headless-cart.mock';

describe('CartRequestSender', () => {
    let cart: Cart;
    let cartRequestSender: CartRequestSender;
    let requestSender: RequestSender;
    let response: Response<Cart>;
    let headlessResponse: Response<HeadlessCartRequestResponse>;

    beforeEach(() => {
        requestSender = createRequestSender();
        cartRequestSender = new CartRequestSender(requestSender);
    });

    describe('#createBuyNowCart', () => {
        const buyNowCartRequestBody: BuyNowCartRequestBody = {
            source: CartSource.BuyNow,
            lineItems: [
                {
                    productId: 1,
                    quantity: 2,
                    optionSelections: {
                        optionId: 11,
                        optionValue: 11,
                    },
                },
            ],
        };

        beforeEach(() => {
            cart = { ...getCart(), source: CartSource.BuyNow };
            response = getResponse(cart);

            jest.spyOn(requestSender, 'post').mockResolvedValue(response);
        });

        it('creates buy now cart', async () => {
            await cartRequestSender.createBuyNowCart(buyNowCartRequestBody);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/carts', {
                body: buyNowCartRequestBody,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('creates buy now cart with timeout', async () => {
            const options = { timeout: createTimeout() };

            await cartRequestSender.createBuyNowCart(buyNowCartRequestBody, options);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/carts', {
                ...options,
                body: buyNowCartRequestBody,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });
    });

    describe('#loadCart', () => {
        const cartId = '123123';

        beforeEach(() => {
            headlessResponse = getResponse(getHeadlessCartResponse());

            jest.spyOn(requestSender, 'get').mockResolvedValue(headlessResponse);
        });

        it('get headless cart', async () => {
            await cartRequestSender.loadCart(cartId);

            expect(requestSender.get).toHaveBeenCalledWith('api/wallet-buttons/cart-information', {
                params: {
                    cartId,
                },
            });
        });
    });
});
