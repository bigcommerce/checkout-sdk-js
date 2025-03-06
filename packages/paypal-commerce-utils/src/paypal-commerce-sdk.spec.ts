import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getPayPalCommerceAcceleratedCheckoutPaymentMethod, getPayPalFastlaneSdk } from './mocks';
import PayPalCommerceSdk from './paypal-commerce-sdk';
import {
    PayPalApmSdk,
    PayPalCommerceHostWindow,
    PayPalFastlaneSdk,
    PayPalMessagesSdk,
} from './paypal-commerce-types';

describe('PayPalCommerceSdk', () => {
    let loader: ScriptLoader;
    let paymentMethod: PaymentMethod;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let subject: PayPalCommerceSdk;
    let mockAPMPaymentMethod: PaymentMethod;

    const paypalMessagesSdk: PayPalMessagesSdk = {
        Messages: jest.fn(),
    };

    const paypalApmsSdk: PayPalApmSdk = {
        Buttons: jest.fn(),
        PaymentFields: jest.fn(),
    };

    const sessionId = '8a232bf4-d9ba-4621-a1a9-ed8f685f92d1';
    const expectedSessionId = sessionId.replace(/-/g, '');

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
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
        subject = new PayPalCommerceSdk(loader);

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypalFastlaneSdk = paypalFastlaneSdk;
            (window as PayPalCommerceHostWindow).paypalMessages = paypalMessagesSdk;
            (window as PayPalCommerceHostWindow).paypalApms = paypalApmsSdk;

            return Promise.resolve();
        });
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypalFastlaneSdk = undefined;
        (window as PayPalCommerceHostWindow).paypalMessages = undefined;
        (window as PayPalCommerceHostWindow).paypalApms = undefined;

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
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': expectedSessionId,
                        'data-namespace': 'paypalFastlaneSdk',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'asdcvY7XFSQasd',
                    },
                },
            );
        });

        it('loads PayPal Fastlane sdk script with data-csp-nonce', async () => {
            const paymentMethodWithNonce = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    cspNonceExperiment: true,
                    cspNonce: 'csp-nonce',
                },
            };
            await subject.getPayPalFastlaneSdk(paymentMethodWithNonce, 'USD', sessionId);

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': expectedSessionId,
                        'data-namespace': 'paypalFastlaneSdk',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'asdcvY7XFSQasd',
                        'data-csp-nonce': 'csp-nonce',
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
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': expectedSessionId,
                        'data-namespace': 'paypalFastlaneSdk',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'connectClientToken123',
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

        it('loads APMs sdk script with data-csp-nonce attribute', async () => {
            const paymentMethodWithNonce = {
                ...paymentMethod,
                initializationData: {
                    ...mockAPMPaymentMethod.initializationData,
                    cspNonce: 'csp-nonce',
                    cspNonceExperiment: true,
                },
            };
            await subject.getPayPalApmsSdk(paymentMethodWithNonce, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&enable-funding=oxxo&commit=true&components=buttons%2Cpayment-fields&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-namespace': 'paypalApms',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-csp-nonce': 'csp-nonce',
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
