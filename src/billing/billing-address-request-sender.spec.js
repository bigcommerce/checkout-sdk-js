import { createTimeout } from '@bigcommerce/request-sender';
import { getBillingAddress } from './internal-billing-addresses.mock';
import BillingAddressRequestSender from './billing-address-request-sender';

describe('BillingAddressRequestSender', () => {
    let addressRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            post: jest.fn(() => Promise.resolve()),
        };

        addressRequestSender = new BillingAddressRequestSender(requestSender);
    });

    describe('#updateAddress()', () => {
        let response;
        beforeEach(() => {
            response = {
                body: {
                    data: {
                        billingAddress: getBillingAddress(),
                    },
                },
            };

            requestSender.post.mockReturnValue(Promise.resolve(response));
        });

        it('updates billing address', async () => {
            await addressRequestSender.updateAddress(getBillingAddress());

            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/billing', {
                body: getBillingAddress(),
                params: {
                    includes: 'cart,quote',
                },
            });
        });

        it('updates billing address with timeout', async () => {
            const options = { timeout: createTimeout() };

            await addressRequestSender.updateAddress(getBillingAddress(), options);

            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/billing', {
                ...options,
                body: getBillingAddress(),
                params: {
                    includes: 'cart,quote',
                },
            });
        });
    });
});
