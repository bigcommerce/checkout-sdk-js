import { createTimeout } from '@bigcommerce/request-sender';

import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';
import BillingAddressRequestSender from './billing-address-request-sender';
import { getBillingAddress } from './internal-billing-addresses.mock';

describe('BillingAddressRequestSender', () => {
    let addressRequestSender;
    let requestSender;
    let response;

    beforeEach(() => {
        requestSender = {
            post: jest.fn(() => Promise.resolve()),
            put: jest.fn(() => Promise.resolve()),
        };

        addressRequestSender = new BillingAddressRequestSender(requestSender);
        response = {
            body: getCheckout(),
        };

        requestSender.put.mockReturnValue(Promise.resolve(response));
        requestSender.post.mockReturnValue(Promise.resolve(response));
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
            });
        });

        it('updates billing address with timeout', async () => {
            const options = { timeout: createTimeout() };

            await addressRequestSender.updateAddress('foo', getBillingAddress(), options);

            expect(requestSender.put).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/billing-address/${id}`, {
                ...options,
                body: address,
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
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });
});
