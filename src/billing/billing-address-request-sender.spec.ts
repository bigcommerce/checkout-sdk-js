import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import BillingAddressRequestSender from './billing-address-request-sender';
import { getBillingAddress } from './billing-addresses.mock';

describe('BillingAddressRequestSender', () => {
    let addressRequestSender: BillingAddressRequestSender;
    let requestSender: RequestSender;
    let response: Response<Checkout>;
    const include = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
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

            expect(requestSender.put).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/billing-address/${id}`, {
                body: address,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });

        it('updates billing address with timeout', async () => {
            const options = { timeout: createTimeout() };

            await addressRequestSender.updateAddress('foo', getBillingAddress(), options);

            expect(requestSender.put).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/billing-address/${id}`, {
                ...options,
                body: address,
                params: {
                    include,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });

    describe('#createAddress()', () => {
        const address = getBillingAddress();

        it('creates billing address', async () => {
            await addressRequestSender.createAddress('foo', address);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/foo/billing-address', {
                body: address,
                params: {
                    include,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });

        it('creates billing address with timeout', async () => {
            const options = { timeout: createTimeout() };

            await addressRequestSender.createAddress('foo', address, options);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/foo/billing-address', {
                ...options,
                body: address,
                params: {
                    include,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });
});
