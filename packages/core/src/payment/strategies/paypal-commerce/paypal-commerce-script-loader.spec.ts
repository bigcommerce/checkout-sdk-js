import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../errors';
import { getPaypalCommerce } from '../../payment-methods.mock';

import PaypalCommerceScriptLoader from './paypal-commerce-script-loader';
import {
    PaypalCommerceHostWindow,
    PaypalCommerceScriptParams,
    PaypalCommerceSDK,
} from './paypal-commerce-sdk';
import { getPaypalCommerceMock } from './paypal-commerce.mock';

describe('PaypalCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PaypalCommerceScriptLoader;
    let paypalSdk: PaypalCommerceSDK;
    let paymentMethod: PaymentMethod;
    let paypalLoadScript: (
        options: PaypalCommerceScriptParams,
    ) => Promise<{ paypal: PaypalCommerceSDK }>;

    const paypalCdn = 'https://unpkg.com/@paypal/paypal-js@5.0.5/dist/iife/paypal-js.min.js';
    const paypalScriptOptions = { async: true, attributes: {} };

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPaypalCommerce();
        paypalSdk = getPaypalCommerceMock();
        paypalLoadScript = jest.fn(
            () =>
                new Promise((resolve) => {
                    (window as PaypalCommerceHostWindow).paypal = paypalSdk;

                    return resolve({ paypalSdk });
                }),
        );

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PaypalCommerceHostWindow).paypalLoadScript = paypalLoadScript;

            return Promise.resolve();
        });

        paypalLoader = new PaypalCommerceScriptLoader(loader);
    });

    afterEach(() => {
        (window as PaypalCommerceHostWindow).paypal = undefined;
        (window as PaypalCommerceHostWindow).paypalLoadScript = undefined;
    });

    it('throws an error if clientId is missing', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                clientId: undefined,
            },
        };

        try {
            await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('loads PayPalSDK script with default configuration', async () => {
        const output = await paypalLoader.getPayPalSDK(paymentMethod, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater', 'venmo'],
            'enable-funding': ['card'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalCdn, paypalScriptOptions);
        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
        expect(output).toEqual(paypalSdk);
    });

    it('loads PayPalSDK script only once even if it calls couple times', async () => {
        const paypalCommerceCreditPaymentMethod = {
            ...paymentMethod,
            id: 'paypalcommercecredit',
        };

        await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        await paypalLoader.getPayPalSDK(paypalCommerceCreditPaymentMethod, 'USD');

        expect(loader.loadScript).toHaveBeenCalledTimes(1);
        expect(paypalLoadScript).toHaveBeenCalledTimes(1);
    });

    it('loads PayPalSDK script with EUR currency', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'EUR');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater', 'venmo'],
            'enable-funding': ['card'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'EUR',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalCommerce script with enabled credit funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isPayPalCreditAvailable: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['venmo'],
            'enable-funding': ['card', 'credit', 'paylater'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalCommerce script with disabled credit funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isPayPalCreditAvailable: false,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater', 'venmo'],
            'enable-funding': ['card'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalCommerce script with enabled Venmo funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isVenmoEnabled: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater'],
            'enable-funding': ['card', 'venmo'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalCommerce script with disabled Venmo funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isVenmoEnabled: false,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater', 'venmo'],
            'enable-funding': ['card'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalCommerce script with enabled several APMs', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                availableAlternativePaymentMethods: [
                    'bancontact',
                    'giropay',
                    'ideal',
                    'mybank',
                    'sofort',
                    'sepa',
                ],
                enabledAlternativePaymentMethods: ['bancontact', 'giropay', 'ideal'],
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater', 'venmo', 'mybank', 'sofort', 'sepa'],
            'enable-funding': ['card', 'bancontact', 'giropay', 'ideal'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalSDK script with commit flag as true', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD', true);

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['credit', 'paylater', 'venmo'],
            'enable-funding': ['card'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalSDK script with commit flag as false', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD', false);

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: false,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('successfully loads paypal sdk with dev configuration', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            id: 'paypalcommerce',
            initializationData: {
                ...paymentMethod.initializationData,
                buyerCountry: 'UA',
                isDeveloperModeApplicable: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodMock, 'USD', false);

        const paypalSdkLoaderOptions = {
            'buyer-country': 'UA',
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: false,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('throw error if unable to load Paypal script', async () => {
        const expectedError = new PaymentMethodClientUnavailableError();

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            throw expectedError;
        });

        try {
            await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('throw error if unable window.paypalLoadScript', async () => {
        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PaypalCommerceHostWindow).paypalLoadScript = undefined;

            return Promise.resolve();
        });

        try {
            await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toEqual(new PaymentMethodClientUnavailableError());
        }
    });
});
