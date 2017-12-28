import { createTimeout } from '@bigcommerce/request-sender';
import { getShippingOptions } from './shipping-options.mock';
import ShippingOptionRequestSender from './shipping-option-request-sender';

describe('ShippingOptionRequestSender', () => {
    let shippingOptionRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            get: jest.fn(() => Promise.resolve()),
            put: jest.fn(() => Promise.resolve()),
        };

        shippingOptionRequestSender = new ShippingOptionRequestSender(requestSender);
    });

    describe('#loadShippingOptions()', () => {
        let response;

        beforeEach(() => {
            response = {
                body: { data: getShippingOptions() },
            };

            requestSender.get.mockReturnValue(Promise.resolve(response));
        });

        it('loads shipping options', async () => {
            const output = await shippingOptionRequestSender.loadShippingOptions();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', {
                params: {
                    includes: 'cart,quote,shippingOptions',
                },
            });
        });

        it('loads shipping options with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await shippingOptionRequestSender.loadShippingOptions(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', {
                ...options,
                params: {
                    includes: 'cart,quote,shippingOptions',
                },
            });
        });
    });

    describe('#selectShippingOption()', () => {
        const addressId = '12312';
        const shippingOptionId = 'shippingoptionid123';

        it('selects shipping option', async () => {
            await shippingOptionRequestSender.selectShippingOption(addressId, shippingOptionId);

            expect(requestSender.put).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', {
                body: {
                    addressId,
                    shippingOptionId,
                },
                params: {
                    includes: 'cart,quote,shippingOptions',
                },
            });
        });

        it('selects shipping option with timeout', async () => {
            const options = { timeout: createTimeout() };

            await shippingOptionRequestSender.selectShippingOption(addressId, shippingOptionId, options);

            expect(requestSender.put).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', {
                ...options,
                body: {
                    addressId,
                    shippingOptionId,
                },
                params: {
                    includes: 'cart,quote,shippingOptions',
                },
            });
        });
    });
});
