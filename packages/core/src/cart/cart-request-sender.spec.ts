import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GQL_REQUEST_URL } from '../common/gql-request';
import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import BuyNowCartRequestBody from './buy-now-cart-request-body';
import Cart from './cart';
import CartRequestSender from './cart-request-sender';
import { getCart } from './carts.mock';
import { GQLCartResponse, GQLCurrencyResponse, GQLRequestResponse } from './gql-cart';
import getCartCurrencyQuery from './gql-cart/get-cart-currency-query';
import getCartQuery from './gql-cart/get-cart-query';
import { getGQLCartResponse, getGQLCurrencyResponse } from './gql-cart/mocks/gql-cart.mock';

describe('CartRequestSender', () => {
    let cart: Cart;
    let cartRequestSender: CartRequestSender;
    let requestSender: RequestSender;
    let response: Response<Cart>;
    let gqlResponse: Response<GQLRequestResponse<GQLCartResponse>>;
    let gqlCurrencyResponse: Response<GQLRequestResponse<GQLCurrencyResponse>>;

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
        const gqlUrl = 'https://test.com/graphql';

        beforeEach(() => {
            gqlResponse = getResponse(getGQLCartResponse());

            jest.spyOn(requestSender, 'post').mockResolvedValue(gqlResponse);
        });

        it('get gql cart', async () => {
            await cartRequestSender.loadCart(cartId);

            expect(requestSender.post).toHaveBeenCalledWith(GQL_REQUEST_URL, {
                body: {
                    query: getCartQuery(cartId),
                },
            });
        });

        it('get gql cart with graphql url', async () => {
            await cartRequestSender.loadCart(cartId, gqlUrl);

            expect(requestSender.post).toHaveBeenCalledWith('https://test.com/graphql', {
                body: {
                    query: getCartQuery(cartId),
                },
            });
        });
    });

    describe('#loadCartCurrency', () => {
        const currencyCode = 'USD';
        const gqlUrl = 'https://test.com/graphql';

        beforeEach(() => {
            gqlCurrencyResponse = getResponse(getGQLCurrencyResponse());

            jest.spyOn(requestSender, 'post').mockResolvedValue(gqlCurrencyResponse);
        });

        it('get gql cart currency', async () => {
            await cartRequestSender.loadCartCurrency(currencyCode);

            expect(requestSender.post).toHaveBeenCalledWith(GQL_REQUEST_URL, {
                body: {
                    query: getCartCurrencyQuery(currencyCode),
                },
            });
        });

        it('get gql cart currency with host url', async () => {
            await cartRequestSender.loadCartCurrency(currencyCode, gqlUrl);

            expect(requestSender.post).toHaveBeenCalledWith('https://test.com/graphql', {
                body: {
                    query: getCartCurrencyQuery(currencyCode),
                },
            });
        });
    });
});
