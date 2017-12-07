import { createTimeout } from '../../http-request';
import { getShippingAddress } from './shipping-address.mock';
import ShippingAddressRequestSender from './shipping-address-request-sender';

describe('ShippingAddressRequestSender', () => {
    let shippingAddressRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            post: jest.fn(() => Promise.resolve()),
        };

        shippingAddressRequestSender = new ShippingAddressRequestSender(requestSender);
    });

    describe('#updateAddress()', () => {
        let response;
        beforeEach(() => {
            response = {
                body: {
                    data: {
                        shippingAddress: getShippingAddress(),
                    },
                },
            };

            requestSender.post.mockReturnValue(Promise.resolve(response));
        });

        it('updates shipping address', async () => {
            const address = getShippingAddress();
            await shippingAddressRequestSender.updateAddress(address);

            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/shipping', {
                body: getShippingAddress(),
                params: {
                    includes: 'cart,quote,shippingOptions',
                },
            });
        });

        it('updates shipping address with timeout', async () => {
            const address = getShippingAddress();
            const options = { timeout: createTimeout() };
            await shippingAddressRequestSender.updateAddress(address, options);

            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/shipping', {
                ...options,
                body: getShippingAddress(),
                params: {
                    includes: 'cart,quote,shippingOptions',
                },
            });
        });
    });
});
