import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommerceScriptLoader from './big-commerce-script-loader';
import {
    BigCommerceHostWindow,
    BigCommerceScriptParams,
    BigCommerceSDK,
} from './big-commerce-types';
import { getBigCommercePaymentMethod, getBigCommerceSDKMock } from './mocks';

describe('BigCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let bigcommerceLoader: BigCommerceScriptLoader;
    let bigcommerceSdk: BigCommerceSDK;
    let paymentMethod: PaymentMethod;
    let bigcommerceLoadScript: (
        options: BigCommerceScriptParams,
    ) => Promise<{ bigcommerce: BigCommerceSDK }>;

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getBigCommercePaymentMethod();
        bigcommerceSdk = getBigCommerceSDKMock();

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as BigCommerceHostWindow).bigcommerce = bigcommerceSdk;

            return Promise.resolve();
        });

        bigcommerceLoader = new BigCommerceScriptLoader(loader);
    });

    afterEach(() => {
        (window as BigCommerceHostWindow).bigcommerce = undefined;
        (window as BigCommerceHostWindow).bigcommerceLoadScript = undefined;
    });

    it('throws an error if initializationData is missing', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: undefined,
        };

        try {
            await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD');
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('loads BigCommerceSDK with default configuration', async () => {
        const output = await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
        expect(output).toEqual(bigcommerceSdk);
    });

    it('loads BigCommerceSDK script every time if force load flag is provided', async () => {
        const paypalCommerceCreditPaymentMethod = {
            ...paymentMethod,
            id: 'paypalcommercecreditcard',
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD');
        await bigcommerceLoader.getBigCommerceSDK(
            paypalCommerceCreditPaymentMethod,
            'USD',
            false,
            true,
        );

        expect(loader.loadScript).toHaveBeenCalledTimes(2);
    });

    it('loads BigCommerceSDK script with EUR currency', async () => {
        await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'EUR');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=EUR&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerce script with disabled card funding', async () => {
        await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerce script with enabled credit funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isPayPalCreditAvailable: true,
            },
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=credit%2Cpaylater&disable-funding=card%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerce script with disabled credit funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isPayPalCreditAvailable: false,
            },
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerce script with enabled Venmo funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isVenmoEnabled: true,
            },
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=venmo&disable-funding=card%2Ccredit%2Cpaylater&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerce script with disabled Venmo funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isVenmoEnabled: false,
            },
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerce script with enabled several APMs', async () => {
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

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=bancontact%2Cgiropay%2Cideal&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo%2Cmybank%2Csofort%2Csepa&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerceSDK script with disabled all APMs', async () => {
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

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodProp, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo%2Cbancontact%2Cgiropay%2Cideal%2Cmybank%2Csofort%2Csepa&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerceSDK script with commit flag as true', async () => {
        await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD', true);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommerceSDK script with commit flag as false', async () => {
        await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('successfully loads BigCommerceSDK script with commit flag as false if Skip Checkout feature off', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isHostedFormEnabled: false,
            },
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodMock, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
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

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodMock, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
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

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodMock, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture&buyer-country=UA';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('successfully loads paypal sdk without nil values in configuration', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            clientToken: '',
            id: 'paypalcommerce',
            initializationData: {
                ...paymentMethod.initializationData,
                attributionId: '',
                merchantId: null,
            },
        };

        await bigcommerceLoader.getBigCommerceSDK(paymentMethodMock, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {};

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('throw error if unable to load Paypal script', async () => {
        const expectedError = new PaymentMethodClientUnavailableError();

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            throw expectedError;
        });

        try {
            await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('throw error if unable window.bigcommerceLoadScript', async () => {
        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as BigCommerceHostWindow).bigcommerceLoadScript = undefined;

            return Promise.resolve();
        });

        try {
            await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toEqual(new PaymentMethodClientUnavailableError());
        }
    });

    it('throws an error if bigcommerce is not loaded due to some issues', async () => {
        bigcommerceLoadScript = jest.fn(
            () =>
                new Promise((_, reject) => {
                    (window as BigCommerceHostWindow).bigcommerce = undefined;

                    return reject(undefined);
                }),
        );

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as BigCommerceHostWindow).bigcommerceLoadScript = bigcommerceLoadScript;

            return Promise.resolve();
        });

        try {
            await bigcommerceLoader.getBigCommerceSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
        }
    });
});
