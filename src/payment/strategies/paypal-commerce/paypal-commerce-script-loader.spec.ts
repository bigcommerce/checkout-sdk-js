import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import PaypalCommerceScriptLoader from './paypal-commerce-script-loader';
import { PaypalCommerceHostWindow, PaypalCommerceScriptOptions, PaypalCommerceSDK } from './paypal-commerce-sdk';
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

    describe('loads PayPalCommerce script with client Id, currency EUR, intent, disableFunding, commit', () => {
        const options: PaypalCommerceScriptOptions = {
            clientId: 'aaa',
            currency: 'EUR',
            disableFunding: ['credit', 'card'],
            intent: 'capture',
        };

        it('check params in script', async () => {
            jest.spyOn(loader, 'loadScript')
                .mockImplementation((url: string) => {
                    (window as PaypalCommerceHostWindow).paypal = paypal;

                    ['client-id=aaa', 'currency=EUR', 'disable-funding=credit,card', 'intent=capture'].forEach(str => {
                        expect(url).toEqual(expect.stringContaining(str));
                    });

                    return Promise.resolve();
                });

            await paypalLoader.loadPaypalCommerce(options);
        });

        it('check paypal in window', async () => {
            const output = await paypalLoader.loadPaypalCommerce(options);

            expect(output).toEqual(paypal);
        });
    });

    describe('loads PayPalCommerce script with client Id and currency USD',  () => {
        const options: PaypalCommerceScriptOptions = {
            clientId: 'aaa',
            currency: 'USD',
        };

        it('check params in script', async () => {
            jest.spyOn(loader, 'loadScript')
                .mockImplementation((url: string) => {
                    (window as PaypalCommerceHostWindow).paypal = paypal;

                    [ 'client-id=aaa', 'currency=USD' ].forEach(str => {
                        expect(url).toEqual(expect.stringContaining(str));
                    });

                    return Promise.resolve();
                });

            await paypalLoader.loadPaypalCommerce(options);
        });

        it('check paypal in window', async () => {
            const output = await paypalLoader.loadPaypalCommerce(options);

            expect(output).toEqual(paypal);
        });
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
