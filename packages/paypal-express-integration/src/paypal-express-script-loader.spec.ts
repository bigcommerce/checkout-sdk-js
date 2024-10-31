import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { getPaypalExpressMock } from './mocks/paypal-express-mock';
import { PaypalHostWindow, PaypalSDK } from './paypal-express-types';

import { PaypalExpressScriptLoader } from './index';

describe('PaypalExpressScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PaypalExpressScriptLoader;
    let paypal: PaypalSDK;

    beforeEach(() => {
        loader = createScriptLoader();
        paypal = getPaypalExpressMock();

        paypalLoader = new PaypalExpressScriptLoader(loader);
    });

    it('loads PayPal script without Merchant Id', async () => {
        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PaypalHostWindow).paypal = paypal;

            return Promise.resolve();
        });

        const output = await paypalLoader.loadPaypalSDK();

        expect(loader.loadScript).toHaveBeenCalledWith(
            '//www.paypalobjects.com/api/checkout.min.js',
            { async: true, attributes: { 'data-merchant-id': '' } },
        );
        expect(output).toEqual(paypal);
    });

    it('loads PayPal script with Merchant Id', async () => {
        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PaypalHostWindow).paypal = paypal;

            return Promise.resolve();
        });

        const output = await paypalLoader.loadPaypalSDK('ABC');

        expect(loader.loadScript).toHaveBeenCalledWith(
            '//www.paypalobjects.com/api/checkout.min.js',
            { async: true, attributes: { 'data-merchant-id': 'ABC' } },
        );
        expect(output).toEqual(paypal);
    });

    it('throws error if unable to load Paypal script', async () => {
        const expectedError = new Error('Unable to load script');

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            throw expectedError;
        });

        try {
            await paypalLoader.loadPaypalSDK();
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });
});
