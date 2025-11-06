import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    getPayPalAcceleratedCheckoutPaymentMethod,
    getPayPalFastlaneSdk,
    getPayPalSDKMock,
} from './mocks';
import PayPalSdkScriptLoader from './paypal-sdk-script-loader';
import {
    PayPalApmSdk,
    PayPalFastlaneSdk,
    PayPalGooglePaySdk,
    PayPalHostWindow,
    PayPalMessagesSdk,
    PayPalSDK,
} from './paypal-types';

describe('PayPalSdkLoader', () => {
    let loader: ScriptLoader;
    let paymentMethod: PaymentMethod;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let paypalSdk: PayPalSDK;
    let subject: PayPalSdkScriptLoader;
    let mockAPMPaymentMethod: PaymentMethod;

    const paypalMessagesSdk: PayPalMessagesSdk = {
        Messages: jest.fn(),
    };

    const paypalApmsSdk: PayPalApmSdk = {
        Buttons: jest.fn(),
        PaymentFields: jest.fn(),
    };

    const payPalGooglePaySdk: PayPalGooglePaySdk = {
        Googlepay: jest.fn(),
    };

    const sessionId = '8a232bf4-d9ba-4621-a1a9-ed8f685f92d1';
    const expectedSessionId = sessionId.replace(/-/g, '');

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPayPalAcceleratedCheckoutPaymentMethod();
        mockAPMPaymentMethod = {
            ...paymentMethod,
            id: 'oxxo',
            initializationData: {
                ...paymentMethod.initializationData,
                enabledAlternativePaymentMethods: ['oxxo'],
                availableAlternativePaymentMethods: ['oxxo'],
            },
        };
        paypalFastlaneSdk = getPayPalFastlaneSdk();
        paypalSdk = getPayPalSDKMock();
        subject = new PayPalSdkScriptLoader(loader);

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalHostWindow).paypal = paypalSdk;
            (window as PayPalHostWindow).paypalFastlaneSdk = paypalFastlaneSdk;
            (window as PayPalHostWindow).paypalMessages = paypalMessagesSdk;
            (window as PayPalHostWindow).paypalApms = paypalApmsSdk;
            (window as PayPalHostWindow).paypalGooglePay = payPalGooglePaySdk;

            return Promise.resolve();
        });
    });

    afterEach(() => {
        (window as PayPalHostWindow).paypal = undefined;
        (window as PayPalHostWindow).paypalFastlaneSdk = undefined;
        (window as PayPalHostWindow).paypalMessages = undefined;
        (window as PayPalHostWindow).paypalApms = undefined;
        (window as PayPalHostWindow).paypalGooglePay = undefined;

        jest.clearAllMocks();
    });

    describe('#getPayPalSDK()', () => {
        it('throws an error if initializationData is missing', async () => {
            const paymentMethodProp = {
                ...paymentMethod,
                initializationData: undefined,
            };

            try {
                await subject.getPayPalSDK(paymentMethodProp, 'USD');
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if clientId is not defined in payment method while getting configuration for PayPal Sdk', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientId: undefined,
                },
            };

            try {
                await subject.getPayPalSDK(mockPaymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads PayPalSDK with default configuration', async () => {
            await subject.getPayPalSDK(paymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=true&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal%2Ccard-fields&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-partner-attribution-id':
                            paymentMethod.initializationData.attributionId,
                        'data-client-token': paymentMethod.clientToken,
                    },
                },
            );
        });

        it('loads PayPalSDK script every time if force load flag is provided', async () => {
            const paypalCommerceCreditPaymentMethod = {
                ...paymentMethod,
                id: 'paypalcommercecreditcard',
            };

            await subject.getPayPalSDK(paymentMethod, 'USD');
            await subject.getPayPalSDK(paypalCommerceCreditPaymentMethod, 'USD', false, true);

            expect(loader.loadScript).toHaveBeenCalledTimes(2);
        });

        it('loads PayPalSDK script with EUR currency', async () => {
            await subject.getPayPalSDK(paymentMethod, 'EUR');

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

        it('loads PayPalCommerce script with disabled card funding', async () => {
            await subject.getPayPalSDK(paymentMethod, 'USD');

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

        it('loads PayPalCommerce script with disabled credit funding', async () => {
            const paymentMethodProp = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isPayPalCreditAvailable: false,
                },
            };

            await subject.getPayPalSDK(paymentMethodProp, 'USD');

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

        it('loads PayPalCommerce script with enabled Venmo funding', async () => {
            const paymentMethodProp = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isVenmoEnabled: true,
                },
            };

            await subject.getPayPalSDK(paymentMethodProp, 'USD');

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

            await subject.getPayPalSDK(paymentMethodProp, 'USD');

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

            await subject.getPayPalSDK(paymentMethodProp, 'USD', false);

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

        it('loads PayPalSDK script with commit flag as true', async () => {
            await subject.getPayPalSDK(paymentMethod, 'USD', true);

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

        it('loads PayPalSDK script with commit flag as false', async () => {
            await subject.getPayPalSDK(paymentMethod, 'USD', false);

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

        it('successfully loads PayPalSDK script with commit flag as false if Skip Checkout feature off', async () => {
            const paymentMethodMock = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isHostedFormEnabled: false,
                },
            };

            await subject.getPayPalSDK(paymentMethodMock, 'USD', false);

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

        it('successfully enables all provided funding sources if methodId equals paypalcommercecreditcards', async () => {
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

            await subject.getPayPalSDK(paymentMethodMock, 'USD', false);

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

        it('successfully enables all provided funding sources if methodId equals bigcommerce_payments_creditcards', async () => {
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

            await subject.getPayPalSDK(paymentMethodMock, 'USD', false);

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

            await subject.getPayPalSDK(paymentMethodMock, 'USD', false);

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

            await subject.getPayPalSDK(paymentMethodMock, 'USD', false);

            const paypalSdkScriptSrc =
                'https://www.paypal.com/sdk/js?client-id=abc&disable-funding=card%2Ccredit%2Cpaylater%2Cvenmo&commit=false&components=buttons%2Chosted-fields%2Cpayment-fields%2Clegal&currency=USD&intent=capture';
            const paypalSdkAttributes = {};

            expect(loader.loadScript).toHaveBeenCalledWith(paypalSdkScriptSrc, {
                async: true,
                attributes: paypalSdkAttributes,
            });
        });

        it('returns PayPal Sdk', async () => {
            const result = await subject.getPayPalSDK(paymentMethod, 'USD');

            expect(result).toEqual(paypalSdk);
        });

        it('throw error if unable to load Paypal script', async () => {
            const expectedError = new PaymentMethodClientUnavailableError();

            jest.spyOn(loader, 'loadScript').mockImplementation(() => {
                throw expectedError;
            });

            try {
                await subject.getPayPalSDK(paymentMethod, 'USD');
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });
    });

    describe('#getPayPalFastlaneSdk()', () => {
        it('throws an error if clientId is not defined in payment method while getting configuration for PayPal Sdk', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientId: undefined,
                },
            };

            try {
                await subject.getPayPalFastlaneSdk(mockPaymentMethod, 'USD', sessionId);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads PayPal Fastlane sdk script', async () => {
            await subject.getPayPalFastlaneSdk(paymentMethod, 'USD', sessionId);

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane%2Cbuttons%2Cpayment-fields%2Chosted-fields%2Cthree-domain-secure&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': expectedSessionId,
                        'data-namespace': 'paypalFastlaneSdk',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-sdk-client-token': 'asdcvY7XFSQasd',
                    },
                },
            );
        });

        // TODO: remove this test when A/B testing will be finished
        it('loads PayPal Fastlane Sdk script with connectClientToken for paypalcommercecreditcards method', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                methodId: 'paypalcommercecreditcards',
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientToken: undefined,
                    connectClientToken: 'connectClientToken123',
                },
            };

            await subject.getPayPalFastlaneSdk(mockPaymentMethod, 'USD', sessionId);

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane%2Cbuttons%2Cpayment-fields%2Chosted-fields%2Cthree-domain-secure&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': expectedSessionId,
                        'data-namespace': 'paypalFastlaneSdk',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-sdk-client-token': 'asdcvY7XFSQasd',
                    },
                },
            );
        });

        it('throws an error if there was an issue with loading PayPal Fastlane Sdk', async () => {
            jest.spyOn(loader, 'loadScript').mockImplementation(jest.fn());

            try {
                await subject.getPayPalFastlaneSdk(paymentMethod, 'USD', sessionId);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('returns PayPal Fastlane Sdk', async () => {
            const result = await subject.getPayPalFastlaneSdk(paymentMethod, 'USD', sessionId);

            expect(result).toEqual(paypalFastlaneSdk);
        });
    });

    describe('#getPayLaterMessages()', () => {
        it('throws an error if clientId is not defined in payment method while getting configuration for PayPal Sdk', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientId: undefined,
                },
            };

            try {
                await subject.getPayPalMessages(mockPaymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads PayLater Messages sdk script', async () => {
            await subject.getPayPalMessages(paymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&components=messages&currency=USD',
                {
                    async: true,
                    attributes: {
                        'data-namespace': 'paypalMessages',
                        'data-partner-attribution-id': '1123JLKJASD12',
                    },
                },
            );
        });

        it('throws an error if there was an issue with loading paylater messages sdk', async () => {
            jest.spyOn(loader, 'loadScript').mockImplementation(jest.fn());

            try {
                await subject.getPayPalMessages(paymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('returns PayPal Messages Sdk', async () => {
            const result = await subject.getPayPalMessages(paymentMethod, 'USD');

            expect(result).toEqual(paypalMessagesSdk);
        });
    });

    describe('#getPayPalGooglePaySdk()', () => {
        it('throws an error if clientId is not defined in payment method while getting configuration for PayPal Sdk', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientId: undefined,
                },
            };

            try {
                await subject.getPayPalGooglePaySdk(mockPaymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads PayPal Google Pay sdk script', async () => {
            await subject.getPayPalGooglePaySdk(paymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=googlepay&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-namespace': 'paypalGooglePay',
                        'data-client-token': 'asdcvY7XFSQasd',
                        'data-partner-attribution-id': '1123JLKJASD12',
                    },
                },
            );
        });

        it('throws an error if there was an issue with loading paypal google pay sdk', async () => {
            jest.spyOn(loader, 'loadScript').mockImplementation(jest.fn());

            try {
                await subject.getPayPalGooglePaySdk(paymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('returns PayPal Google Pay Sdk', async () => {
            const result = await subject.getPayPalGooglePaySdk(paymentMethod, 'USD');

            expect(result).toEqual(payPalGooglePaySdk);
        });

        it('does not load Google Pay Sdk if already exist', async () => {
            await subject.getPayPalGooglePaySdk(paymentMethod, 'USD');
            await subject.getPayPalGooglePaySdk(paymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('reload Google Pay Sdk', async () => {
            await subject.getPayPalGooglePaySdk(paymentMethod, 'USD');
            await subject.getPayPalGooglePaySdk(paymentMethod, 'USD', false, true);

            expect(loader.loadScript).toHaveBeenCalledTimes(2);
        });
    });

    describe('#getPayPalApmsSdk()', () => {
        it('throws an error if clientId is not defined in payment method while getting configuration for PayPal Sdk', async () => {
            try {
                await subject.getPayPalApmsSdk(
                    {
                        ...mockAPMPaymentMethod,
                        initializationData: {
                            ...mockAPMPaymentMethod.initializationData,
                            clientId: undefined,
                        },
                    },
                    'USD',
                );
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads APMs sdk script', async () => {
            await subject.getPayPalApmsSdk(mockAPMPaymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=oxxo&commit=true&components=buttons%2Cpayment-fields&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-namespace': 'paypalApms',
                        'data-partner-attribution-id': '1123JLKJASD12',
                    },
                },
            );
        });

        it('throws an error if there was an issue with loading APMs sdk', async () => {
            jest.spyOn(loader, 'loadScript').mockImplementation(jest.fn());

            try {
                await subject.getPayPalApmsSdk(mockAPMPaymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('returns PayPal APMs Sdk', async () => {
            const result = await subject.getPayPalApmsSdk(paymentMethod, 'USD');

            expect(result).toEqual(paypalApmsSdk);
        });
    });
});
