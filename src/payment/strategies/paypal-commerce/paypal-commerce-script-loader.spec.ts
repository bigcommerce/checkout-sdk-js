import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import PaypalCommerceScriptLoader from './paypal-commerce-script-loader';
import { PaypalCommerceHostWindow, PaypalCommerceSDK } from './paypal-commerce-sdk';
import { getPaypalCommerceMock } from './paypal-commerce.mock';

describe('PaypalCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PaypalCommerceScriptLoader;
    let paypal: PaypalCommerceSDK;

    beforeEach(() => {
        loader = createScriptLoader();
        paypal = getPaypalCommerceMock();

        paypalLoader = new PaypalCommerceScriptLoader(loader);
    });

    it('loads PayPalCommerce script  with client Id and without currency', async () => {
        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalCommerceHostWindow).paypal = paypal;

                return Promise.resolve();
            });

        const output = await paypalLoader.loadPaypalCommerce('aaa');

        expect(loader.loadScript).toHaveBeenCalledWith('https://www.paypal.com/sdk/js?currency=USD&client-id=aaa', {async: true, attributes: {}});
        expect(output).toEqual(paypal);
    });

    it('loads PayPalCommerce script  with client Id and with currency', async () => {
        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalCommerceHostWindow).paypal = paypal;

                return Promise.resolve();
            });

        const output = await paypalLoader.loadPaypalCommerce('aaa', 'EUR');

        expect(loader.loadScript).toHaveBeenCalledWith('https://www.paypal.com/sdk/js?currency=EUR&client-id=aaa', {async: true, attributes: {}});
        expect(output).toEqual(paypal);
    });

    it('throw error without client Id', async () => {
        const expectedError = new InvalidArgumentError();

        try {
            await paypalLoader.loadPaypalCommerce('');
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('throw error if unable to load Paypal script', async () => {
        const expectedError = new PaymentMethodClientUnavailableError();

        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await paypalLoader.loadPaypalCommerce('aaa');
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });
});
