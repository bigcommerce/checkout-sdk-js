import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsScriptLoader from './bigcommerce-payments-script-loader';
import { BigCommercePaymentsHostWindow, PayPalSDK } from './bigcommerce-payments-types';
import { getBigCommercePaymentsPaymentMethod, getPayPalSDKMock } from './mocks';

describe('BigCommercePaymentsScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: BigCommercePaymentsScriptLoader;
    let paypalSdk: PayPalSDK;
    let paymentMethod: PaymentMethod;

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getBigCommercePaymentsPaymentMethod();
        paypalSdk = getPayPalSDKMock();

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as BigCommercePaymentsHostWindow).bigCommercePaymentsPayPalSDK = paypalSdk;

            return Promise.resolve();
        });

        paypalLoader = new BigCommercePaymentsScriptLoader(loader);
    });

    afterEach(() => {
        (window as BigCommercePaymentsHostWindow).bigCommercePaymentsPayPalSDK = undefined;
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

    it('loads PayPalSDK with default configuration', async () => {
        const output = await paypalLoader.getPayPalSDK(paymentMethod, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
        expect(output).toEqual(paypalSdk);
    });

    it('loads PayPalSDK with the client metadata id', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD', true, false, 'cmid123');

        expect(loader.loadScript).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                attributes: expect.objectContaining({ 'data-client-metadata-id': 'cmid123' }),
            }),
        );
    });

    describe('#getClientMetadataId', () => {
        let realPaypalLoader: BigCommercePaymentsScriptLoader;

        const cardPaymentMethod = () => ({
            ...paymentMethod,
            id: 'bigcommerce_payments_creditcards',
        });

        const sdkScripts = () =>
            Array.from(
                document.querySelectorAll<HTMLScriptElement>(
                    'script[data-namespace="bigCommercePaymentsPayPalSDK"]',
                ),
            );

        const completeScript = (script: HTMLScriptElement) => {
            const loadedSdk = getPayPalSDKMock();

            (window as BigCommercePaymentsHostWindow).bigCommercePaymentsPayPalSDK = loadedSdk;
            script.dispatchEvent(new Event('load'));

            return loadedSdk;
        };

        beforeEach(() => {
            realPaypalLoader = new BigCommercePaymentsScriptLoader(createScriptLoader());
        });

        afterEach(() => {
            sdkScripts().forEach((script) => script.remove());
        });

        it('returns undefined for an sdk it did not load', () => {
            expect(paypalLoader.getClientMetadataId(getPayPalSDKMock())).toBeUndefined();
        });

        it('returns the client metadata id of the script that created the sdk', async () => {
            const loading = realPaypalLoader.getPayPalSDK(
                cardPaymentMethod(),
                'USD',
                true,
                true,
                'cartA',
            );
            const cardSdk = completeScript(sdkScripts()[0]);

            await loading;

            expect(realPaypalLoader.getClientMetadataId(cardSdk)).toBe('cartA');
        });

        it('keeps the first client metadata id when the sdk is reloaded for another cart', async () => {
            const firstLoading = realPaypalLoader.getPayPalSDK(
                cardPaymentMethod(),
                'USD',
                true,
                true,
                'cartA',
            );
            const cardSdk = completeScript(sdkScripts()[0]);

            await firstLoading;
            await realPaypalLoader.getPayPalSDK(cardPaymentMethod(), 'USD', true, true, 'cartB');

            expect(sdkScripts()).toHaveLength(1);
            expect(realPaypalLoader.getClientMetadataId(cardSdk)).toBe('cartA');
        });

        it('keeps each sdk with its own client metadata id when a later script loads first', async () => {
            const cardLoading = realPaypalLoader.getPayPalSDK(
                cardPaymentMethod(),
                'USD',
                true,
                true,
                'cartA',
            );
            const buttonLoading = new BigCommercePaymentsScriptLoader(
                createScriptLoader(),
            ).getPayPalSDK(paymentMethod, 'USD', true, true);
            const [cardScript, buttonScript] = sdkScripts();

            const buttonSdk = completeScript(buttonScript);

            await buttonLoading;

            const cardSdk = completeScript(cardScript);

            await expect(cardLoading).resolves.toBe(cardSdk);
            expect(realPaypalLoader.getClientMetadataId(cardSdk)).toBe('cartA');
            expect(realPaypalLoader.getClientMetadataId(buttonSdk)).toBeUndefined();
        });
    });

    it('loads PayPalSDK script every time if force load flag is provided', async () => {
        const bigCommercePaymentsCreditPaymentMethod = {
            ...paymentMethod,
            id: 'bigcommerce_payments_creditcards',
        };

        await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        await paypalLoader.getPayPalSDK(bigCommercePaymentsCreditPaymentMethod, 'USD', false, true);

        expect(loader.loadScript).toHaveBeenCalledTimes(2);
    });

    it('loads PayPalSDK script with EUR currency', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'EUR');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=EUR&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommercePayments script with disabled card funding', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommercePayments script with enabled credit funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isPayPalCreditAvailable: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=credit%2Cpaylater&disable-funding=card%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommercePayments script with disabled credit funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isPayPalCreditAvailable: false,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommercePayments script with enabled Venmo funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isVenmoEnabled: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=venmo&disable-funding=card%2Ccredit%2Cpaylater&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommercePayments script with disabled Venmo funding', async () => {
        const paymentMethodProp = {
            ...paymentMethod,
            initializationData: {
                ...paymentMethod.initializationData,
                isVenmoEnabled: false,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads BigCommercePayments script with enabled several APMs (Klarna, Afterpay should not be included)', async () => {
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
                    'klarna',
                    'afterpay',
                ],
                enabledAlternativePaymentMethods: [
                    'bancontact',
                    'giropay',
                    'ideal',
                    'klarna',
                    'afterpay',
                ],
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodProp, 'USD');

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=bancontact%2Cgiropay%2Cideal&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo%2Cmybank%2Csofort%2Csepa&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads PayPalSDK script with commit flag as true', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD', true);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('loads PayPalSDK script with commit flag as false', async () => {
        await paypalLoader.getPayPalSDK(paymentMethod, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
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

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('successfully enables all provided funding sources', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            id: 'bigcommerce_payments_creditcards',
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

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
        };

        expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
            async: true,
            attributes: paypalSdkAttributes,
        });
    });

    it('successfully loads paypal sdk with dev configuration', async () => {
        const paymentMethodMock = {
            ...paymentMethod,
            id: 'bigcommerce_payments',
            initializationData: {
                ...paymentMethod.initializationData,
                buyerCountry: 'UA',
                isDeveloperModeApplicable: true,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodMock, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture&buyer-country=UA';
        const paypalSdkAttributes = {
            'data-client-token': paymentMethod.clientToken,
            'data-partner-attribution-id': paymentMethod.initializationData.attributionId,
            'data-namespace': 'bigCommercePaymentsPayPalSDK',
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
            id: 'bigcommerce_payments',
            initializationData: {
                ...paymentMethod.initializationData,
                attributionId: '',
                merchantId: null,
            },
        };

        await paypalLoader.getPayPalSDK(paymentMethodMock, 'USD', false);

        const paypalSdkScriptSrc =
            'https://www.paypal.com/sdk/js?client-id=abc&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
        const paypalSdkAttributes = { 'data-namespace': 'bigCommercePaymentsPayPalSDK' };

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
            await paypalLoader.getPayPalSDK(paymentMethod, 'USD');
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });
});
