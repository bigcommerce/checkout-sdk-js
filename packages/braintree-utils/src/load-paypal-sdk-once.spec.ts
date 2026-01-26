import loadPayPalSDKOnce, { resetLoadPayPalSDKOncePromise } from './load-paypal-sdk-once';
import { BraintreePaypalCheckout } from './braintree';
import { BraintreeError } from './types';

describe('loadPayPalSDKOnce', () => {
    let paypalCheckout: BraintreePaypalCheckout;

    const config = {
        clientId: '12341234',
        currency: 'US',
    };

    beforeEach(() => {
        paypalCheckout = {
            loadPayPalSDK: jest.fn(),
            createPayment: jest.fn(),
            teardown: jest.fn(),
            tokenizePayment: jest.fn(),
        };

        jest.clearAllMocks();
        resetLoadPayPalSDKOncePromise();
    });

    it('loads PayPal SDK once', async () => {
        jest.spyOn(paypalCheckout, 'loadPayPalSDK').mockImplementation((_config, callback) =>
            callback(null),
        );

        const result = await loadPayPalSDKOnce(paypalCheckout, config);

        expect(paypalCheckout.loadPayPalSDK).toHaveBeenCalledTimes(1);
        expect(result).toBe(paypalCheckout);
    });

    it('does not call loadPayPalSDKOnce twice', async () => {
        jest.spyOn(paypalCheckout, 'loadPayPalSDK').mockImplementation((_config, callback) =>
            callback(null),
        );

        const result1 = await loadPayPalSDKOnce(paypalCheckout, config);
        const result2 = await loadPayPalSDKOnce(paypalCheckout, config);

        expect(paypalCheckout.loadPayPalSDK).toHaveBeenCalledTimes(1);
        expect(result1).toBe(paypalCheckout);
        expect(result2).toBe(paypalCheckout);
    });

    it('returns the same promise when called multiple times before resolve', async () => {
        jest.spyOn(paypalCheckout, 'loadPayPalSDK').mockImplementation((_config, callback) => {
            setTimeout(() => {
                callback(null);
            }, 10);
        });

        const promise1 = loadPayPalSDKOnce(paypalCheckout, config);
        const promise2 = loadPayPalSDKOnce(paypalCheckout, config);

        expect(paypalCheckout.loadPayPalSDK).toHaveBeenCalledTimes(1);
        expect(promise1).toBe(promise2);

        const result = await promise1;
        expect(result).toBe(paypalCheckout);
    });

    it('rejects if loadPayPalSDKOnce returns an error', async () => {
        const error = new Error('load failed');

        jest.spyOn(paypalCheckout, 'loadPayPalSDK').mockImplementation((_config, callback) =>
            callback(error as BraintreeError),
        );

        await expect(loadPayPalSDKOnce(paypalCheckout, config)).rejects.toThrow('load failed');

        expect(paypalCheckout.loadPayPalSDK).toHaveBeenCalledTimes(1);
    });
});
