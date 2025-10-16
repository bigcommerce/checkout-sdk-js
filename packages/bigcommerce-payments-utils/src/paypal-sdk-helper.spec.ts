import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    PayPalApmSdk,
    PayPalFastlaneSdk,
    PayPalGooglePaySdk,
    PayPalHostWindow,
    PayPalMessagesSdk,
} from './bigcommerce-payments-types';
import { getBigCommercePaymentsFastlanePaymentMethod, getPayPalFastlaneSdk } from './mocks';
import PayPalSdkHelper from './paypal-sdk-helper';

describe('PayPalSdkHelper', () => {
    let loader: ScriptLoader;
    let paymentMethod: PaymentMethod;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let subject: PayPalSdkHelper;
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
        paymentMethod = getBigCommercePaymentsFastlanePaymentMethod();
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
        subject = new PayPalSdkHelper(loader);

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalHostWindow).paypalFastlaneSdk = paypalFastlaneSdk;
            (window as PayPalHostWindow).paypalMessages = paypalMessagesSdk;
            (window as PayPalHostWindow).paypalApms = paypalApmsSdk;
            (window as PayPalHostWindow).paypalGooglePay = payPalGooglePaySdk;

            return Promise.resolve();
        });
    });

    afterEach(() => {
        (window as PayPalHostWindow).paypalFastlaneSdk = undefined;
        (window as PayPalHostWindow).paypalMessages = undefined;
        (window as PayPalHostWindow).paypalApms = undefined;
        (window as PayPalHostWindow).paypalGooglePay = undefined;

        jest.clearAllMocks();
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
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane%2Cthree-domain-secure&currency=USD&intent=capture',
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
        it('loads PayPal Fastlane Sdk script with connectClientToken for bigcommerce_payments_creditcards method', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                methodId: 'bigcommerce_payments_creditcards',
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientToken: undefined,
                    connectClientToken: 'connectClientToken123',
                },
            };

            await subject.getPayPalFastlaneSdk(mockPaymentMethod, 'USD', sessionId);

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane%2Cthree-domain-secure&currency=USD&intent=capture',
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

        it('loads APMs sdk script for Klarna method id', async () => {
            const apmKlarnaPaymentMethodMock = {
                ...paymentMethod,
                id: 'klarna',
                initializationData: {
                    ...paymentMethod.initializationData,
                    enabledAlternativePaymentMethods: ['klarna'],
                    availableAlternativePaymentMethods: ['klarna'],
                },
            };

            await subject.getPayPalApmsSdk(apmKlarnaPaymentMethodMock, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=buttons%2Cpayment-fields&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-namespace': 'paypalApms',
                        'data-partner-attribution-id': '1123JLKJASD12',
                    },
                },
            );
        });

        it('returns PayPal APMs Sdk', async () => {
            const result = await subject.getPayPalApmsSdk(paymentMethod, 'USD');

            expect(result).toEqual(paypalApmsSdk);
        });
    });
});
