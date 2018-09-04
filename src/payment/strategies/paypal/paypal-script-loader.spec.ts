import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import PaypalScriptLoader from './paypal-script-loader';
import { PaypalHostWindow, PaypalSDK } from './paypal-sdk';
import { getPaypalMock } from './paypal.mock';

describe('PaypalScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PaypalScriptLoader;
    let paypal: PaypalSDK;

    beforeEach(() => {
        loader = createScriptLoader();
        paypal = getPaypalMock();

        paypalLoader = new PaypalScriptLoader(loader);
    });

    it('loads PayPal script', async () => {
        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalHostWindow).paypal = paypal;

                return Promise.resolve();
            });

        const output = await paypalLoader.loadPaypal();

        expect(loader.loadScript).toHaveBeenCalledWith('//www.paypalobjects.com/api/checkout.min.js');
        expect(output).toEqual(paypal);
    });

    it('throws error if unable to load Paypal script', async () => {
        const expectedError = new Error('Unable to load script');

        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await paypalLoader.loadPaypal();
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });
});
