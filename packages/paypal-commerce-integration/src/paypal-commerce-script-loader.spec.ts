import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getPayPalCommercePaymentMethod, getPayPalSDKMock } from './mocks';
import PayPalCommerceScriptLoader from './paypal-commerce-script-loader';
import {
    PayPalCommerceHostWindow,
    PayPalCommerceScriptParams,
    PayPalSDK,
} from './paypal-commerce-types';

describe('PayPalCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PayPalCommerceScriptLoader;
    let paypalSdk: PayPalSDK;
    let paymentMethod: PaymentMethod;
    let paypalLoadScript: (options: PayPalCommerceScriptParams) => Promise<{ paypal: PayPalSDK }>;

    const paypalCdn = 'https://unpkg.com/@paypal/paypal-js@5.0.5/dist/iife/paypal-js.min.js';
    const paypalScriptOptions = { async: true, attributes: {} };

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPayPalCommercePaymentMethod();
        paypalSdk = getPayPalSDKMock();
        paypalLoadScript = jest.fn(
            () =>
                new Promise((resolve) => {
                    (window as PayPalCommerceHostWindow).paypal = paypalSdk;

                    return resolve({ paypalSdk });
                }),
        );

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypalLoadScript = paypalLoadScript;

            return Promise.resolve();
        });

        paypalLoader = new PayPalCommerceScriptLoader(loader);
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypal = undefined;
        (window as PayPalCommerceHostWindow).paypalLoadScript = undefined;
    });

    it('throws an error if initializationData is missing', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: undefined,
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
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalCdn, paypalScriptOptions);
        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
        expect(output).toEqual(paypalSdk);
    });

    it('loads PayPalSDK script every time even if it calls couple times', async () => {
        const paypalCommerceCreditPaymentMethod = {
            ...paymentMethod,
            id: 'paypalcommercecredit',
        };

        await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        await paypalLoader.getPayPalSDK(paypalCommerceCreditPaymentMethod, 'USD');

        expect(loader.loadScript).toHaveBeenCalledTimes(1);
        expect(paypalLoadScript).toHaveBeenCalledTimes(2);
    });

    it('loads PayPalSDK script with EUR currency', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'EUR');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: 'EUR',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalCommerce script with disabled card funding', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD');

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: 'USD',
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
            'disable-funding': ['card', 'venmo'],
            'enable-funding': ['credit', 'paylater'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            'disable-funding': ['card', 'credit', 'paylater'],
            'enable-funding': ['venmo'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            'disable-funding': ['card', 'credit', 'paylater', 'venmo', 'mybank', 'sofort', 'sepa'],
            'enable-funding': ['bancontact', 'giropay', 'ideal'],
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('loads PayPalSDK script with disabled all APMs', async () => {
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
                isHostedCheckoutEnabled: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD', false);

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': [
                'card',
                'credit',
                'paylater',
                'venmo',
                'bancontact',
                'giropay',
                'ideal',
                'mybank',
                'sofort',
                'sepa',
            ],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: true,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('successfully loads PayPalSDK script with commit flag as false if Skip Checkout feature off', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isHostedFormEnabled: false,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodMock, 'USD', false);

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': ['card', 'credit', 'paylater', 'venmo'],
            'enable-funding': undefined,
            commit: false,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: 'USD',
            intent: 'capture',
        };

        expect(paypalLoadScript).toHaveBeenCalledWith(paypalSdkLoaderOptions);
    });

    it('successfully enables all provided funding sources', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            id: 'paypalcommercecreditcards',
            initializationData: {
                ...paymentMethod.initializationData,
                isHostedCheckoutEnabled: false,
                isVenmoEnabled: true,
                isPayPalCreditAvailable: true,
                availableAlternativePaymentMethods: [],
                enabledAlternativePaymentMethods: [],
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodMock, 'USD', false);

        const paypalSdkLoaderOptions = {
            'client-id': paymentMethod.initializationData.clientId,
            'merchant-id': paymentMethod.initializationData.merchantId,
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'disable-funding': undefined,
            'enable-funding': ['card', 'credit', 'paylater', 'venmo'],
            commit: false,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
            (window as PayPalCommerceHostWindow).paypalLoadScript = undefined;

            return Promise.resolve();
        });

        try {
            await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toEqual(new PaymentMethodClientUnavailableError());
        }
    });

    it('throws an error if paypal is not loaded due to some issues', async () => {
        paypalLoadScript = jest.fn(
            () =>
                new Promise((resolve) => {
                    (window as PayPalCommerceHostWindow).paypal = undefined;

                    return resolve(undefined);
                }),
        );

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypalLoadScript = paypalLoadScript;

            return Promise.resolve();
        });

        try {
            await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
        }
    });
});
