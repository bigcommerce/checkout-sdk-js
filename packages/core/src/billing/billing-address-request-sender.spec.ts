import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { EmptyCartError } from '../cart/errors';
import { Checkout } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import BillingAddressRequestSender from './billing-address-request-sender';
import { getBillingAddress } from './billing-addresses.mock';

describe('BillingAddressRequestSender', () => {
    let addressRequestSender: BillingAddressRequestSender;
    let requestSender: RequestSender;
    let response: Response<Checkout>;
    const include = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.physicalItems.stockPosition',
        'cart.lineItems.digitalItems.options',
        'cart.lineItems.digitalItems.stockPosition',
        'customer',
        'promotions.banners',
    ].join(',');

    beforeEach(() => {
        requestSender = createRequestSender();

        addressRequestSender = new BillingAddressRequestSender(requestSender);
        response = getResponse(getCheckout());

        jest.spyOn(requestSender, 'post').mockResolvedValue(response);
        jest.spyOn(requestSender, 'put').mockResolvedValue(response);
    });

    describe('#updateAddress()', () => {
        const { id, ...address } = getBillingAddress();

        it('updates billing address', async () => {
            await addressRequestSender.updateAddress('foo', getBillingAddress());

            expect(requestSender.put).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/billing-address/${id}`,
                {
                    body: address,
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

        it('updates billing address with timeout', async () => {
            const options = { timeout: createTimeout() };

            await addressRequestSender.updateAddress('foo', getBillingAddress(), options);

            expect(requestSender.put).toHaveBeenCalledWith(
                `/api/storefront/checkouts/foo/billing-address/${id}`,
                {
                    ...options,
                    body: address,
                    params: {
                        include,
                    },
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
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
                addressRequestSender.updateAddress('foo', getBillingAddress()),
            ).rejects.toThrow(EmptyCartError);
        });
    });

    describe('#createAddress()', () => {
        const address = getBillingAddress();

        it('creates billing address', async () => {
            await addressRequestSender.createAddress('foo', address);

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/foo/billing-address',
                {
                    body: address,
                    params: {
                        include,
                    },
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                },
            );
        });

        it('creates billing address with timeout', async () => {
            const options = { timeout: createTimeout() };

            await addressRequestSender.createAddress('foo', address, options);

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/foo/billing-address',
                {
                    ...options,
                    body: address,
                    params: {
                        include,
                    },
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
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
                addressRequestSender.createAddress('foo', getBillingAddress()),
            ).rejects.toThrow(EmptyCartError);
        });
    });
});
