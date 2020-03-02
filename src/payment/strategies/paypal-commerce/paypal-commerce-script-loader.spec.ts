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

        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalCommerceHostWindow).paypal = paypal;

                return Promise.resolve();
            });

        paypalLoader = new PaypalCommerceScriptLoader(loader);
    });

    it('loads PayPalCommerce script  with client Id and currency USD', async () => {
        const output = await paypalLoader.loadPaypalCommerce({ clientId: 'aaa', currency: 'USD' });

        expect(loader.loadScript).toHaveBeenCalledWith('https://www.paypal.com/sdk/js?client-id=aaa&currency=USD', {async: true, attributes: {}});
        expect(output).toEqual(paypal);
    });

    it('loads PayPalCommerce script  with client Id and with currency EUR', async () => {
        const output = await paypalLoader.loadPaypalCommerce({ clientId: 'aaa', currency: 'EUR' });

        expect(loader.loadScript).toHaveBeenCalledWith('https://www.paypal.com/sdk/js?client-id=aaa&currency=EUR', {async: true, attributes: {}});
        expect(output).toEqual(paypal);
    });

    it('throw error without client Id', async () => {
        try {
            await paypalLoader.loadPaypalCommerce({ clientId: '', currency: 'USD' });
        } catch (error) {
            expect(error).toEqual( new InvalidArgumentError());
        }
    });

    it('throw error if unable to load Paypal script', async () => {
        const expectedError = new PaymentMethodClientUnavailableError();

        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await paypalLoader.loadPaypalCommerce({ clientId: 'aaa', currency: 'USD' });
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('throw error if unable window.paypal', async () => {
        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalCommerceHostWindow).paypal = undefined;

                return Promise.resolve();
            });

        try {
            await paypalLoader.loadPaypalCommerce({clientId: 'aaa', currency: 'EUR'});
        } catch (error) {
            expect(error).toEqual(new PaymentMethodClientUnavailableError());
        }

    });
});
