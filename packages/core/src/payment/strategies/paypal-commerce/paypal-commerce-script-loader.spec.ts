import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import PaypalCommerceScriptLoader from './paypal-commerce-script-loader';
import { PaypalCommerceHostWindow, PaypalCommerceScriptParams, PaypalCommerceSDK } from './paypal-commerce-sdk';
import { getPaypalCommerceMock } from './paypal-commerce.mock';

describe('PaypalCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PaypalCommerceScriptLoader;
    let paypal: PaypalCommerceSDK;
    let paypalLoadScript: (options: PaypalCommerceScriptParams) => Promise<{ paypal: PaypalCommerceSDK }>;

    beforeEach(() => {
        loader = createScriptLoader();
        paypal = getPaypalCommerceMock();
        paypalLoadScript = jest.fn(() => new Promise(resolve => {
            (window as PaypalCommerceHostWindow).paypal = paypal;

            return resolve({ paypal });
        }));

        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalCommerceHostWindow).paypalLoadScript = paypalLoadScript;

                return Promise.resolve();
            });

        paypalLoader = new PaypalCommerceScriptLoader(loader);
    });

    afterEach(() => {
        (window as PaypalCommerceHostWindow).paypalLoadScript = undefined;
    });

    describe('loads PayPalCommerce script with client Id, currency EUR, intent, disableFunding, commit', () => {
        const params: PaypalCommerceScriptParams = {
            'client-id': 'aaa',
            'merchant-id': 'bbb',
            'disable-funding': ['credit', 'card'],
            currency: 'EUR',
            intent: 'capture',
        };

        it('call loadScript', async () => {
            await paypalLoader.loadPaypalCommerce(params);

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://unpkg.com/@paypal/paypal-js@1.0.2/dist/paypal.browser.min.js',
                { async: true, attributes: {} }
            );
        });

        it('call paypalLoadScript with params', async () => {
            await paypalLoader.loadPaypalCommerce(params);

            expect(paypalLoadScript).toHaveBeenCalledWith(params);
        });

        it('check paypal in window', async () => {
            const output = await paypalLoader.loadPaypalCommerce(params);

            expect(output).toEqual(paypal);
        });
    });

    describe('loads PayPalCommerce script with client Id and currency USD',  () => {
        const params: PaypalCommerceScriptParams = {
            'client-id': 'aaa',
            'merchant-id': 'bbb',
            currency: 'USD',
        };

        it('check params in script', async () => {
            await paypalLoader.loadPaypalCommerce(params);

            expect(paypalLoadScript).toHaveBeenCalledWith({ 'client-id': 'aaa', currency: 'USD', 'merchant-id': 'bbb' });
        });

        it('check paypal in window', async () => {
            const output = await paypalLoader.loadPaypalCommerce(params);

            expect(output).toEqual(paypal);
        });
    });

    it('do not add merchant Id if it is null and enable progressive onboarding', async () => {
        const params: PaypalCommerceScriptParams = { 'client-id': 'aaa', 'merchant-id': undefined };

        await paypalLoader.loadPaypalCommerce(params, true);

        expect(paypalLoadScript).toHaveBeenCalledWith({ 'client-id': 'aaa' });
    });

    it('throw error without merchant Id and disable progressive onboarding ', async () => {
        try {
            await paypalLoader.loadPaypalCommerce({ 'client-id': 'aaa', 'merchant-id': '', currency: 'USD' }, false);
        } catch (error) {
            expect(error).toEqual(new InvalidArgumentError(`Unable to proceed because "merchant-id" argument in PayPal script is not provided.`));
        }
    });

    it('throw error without client Id', async () => {
        try {
            await paypalLoader.loadPaypalCommerce({ 'client-id': '', 'merchant-id': 'bbb', currency: 'USD' });
        } catch (error) {
            expect(error).toEqual(new InvalidArgumentError(`Unable to proceed because "client-id" argument in PayPal script is not provided.`));
        }
    });

    it('throw error if unable to load Paypal script', async () => {
        const expectedError = new PaymentMethodClientUnavailableError();

        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await paypalLoader.loadPaypalCommerce({ 'client-id': 'aaa', 'merchant-id': 'bbb', currency: 'USD' });
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('throw error if unable window.paypalLoadScript', async () => {
        jest.spyOn(loader, 'loadScript')
            .mockImplementation(() => {
                (window as PaypalCommerceHostWindow).paypalLoadScript = undefined;

                return Promise.resolve();
            });

        try {
            await paypalLoader.loadPaypalCommerce({ 'client-id': 'aaa', 'merchant-id': 'bbb', currency: 'EUR'});
        } catch (error) {
            expect(error).toEqual(new PaymentMethodClientUnavailableError());
        }

    });
});
