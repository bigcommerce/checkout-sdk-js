import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    getPayPalAxoSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalFastlaneSdk,
} from './mocks';
import PayPalCommerceSdk from './paypal-commerce-sdk';
import {
    PayPalAxoSdk,
    PayPalCommerceHostWindow,
    PayPalFastlaneSdk,
    PayPalMessagesSdk,
} from './paypal-commerce-types';

describe('PayPalCommerceSdk', () => {
    let loader: ScriptLoader;
    let paymentMethod: PaymentMethod;
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let subject: PayPalCommerceSdk;

    const paypalMessagesSdk: PayPalMessagesSdk = {
        Messages: jest.fn(),
    };

    Object.defineProperty(window, 'crypto', {
        value: {
            randomUUID: () => '123456789',
        },
    });

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
        paypalAxoSdk = getPayPalAxoSdk();
        paypalFastlaneSdk = getPayPalFastlaneSdk();
        subject = new PayPalCommerceSdk(loader);

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypalAxo = paypalAxoSdk;
            (window as PayPalCommerceHostWindow).paypalFastlaneSdk = paypalFastlaneSdk;
            (window as PayPalCommerceHostWindow).paypalMessages = paypalMessagesSdk;

            return Promise.resolve();
        });
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypalAxo = undefined;
        (window as PayPalCommerceHostWindow).paypalFastlaneSdk = undefined;
        (window as PayPalCommerceHostWindow).paypalMessages = undefined;

        jest.clearAllMocks();
    });

    describe('#getPayPalAxo()', () => {
        it('throws an error if clientId is not defined in payment method while getting configuration for PayPal Sdk', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientId: undefined,
                },
            };

            try {
                await subject.getPayPalAxo(mockPaymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads PayPal Axo sdk script', async () => {
            await subject.getPayPalAxo(paymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=connect&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': '123456789',
                        'data-namespace': 'paypalAxo',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'asdcvY7XFSQasd',
                    },
                },
            );
        });

        // TODO: remove this test when A/B testing will be finished
        it('loads PayPal Axo sdk script with connectClientToken for paypalcommercecreditcards method', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                methodId: 'paypalcommercecreditcards',
                initializationData: {
                    ...paymentMethod.initializationData,
                    clientToken: undefined,
                    connectClientToken: 'connectClientToken123',
                },
            };

            await subject.getPayPalAxo(mockPaymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=connect&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': '123456789',
                        'data-namespace': 'paypalAxo',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'connectClientToken123',
                    },
                },
            );
        });

        it('throws an error if there was an issue with loading paypal axo sdk', async () => {
            jest.spyOn(loader, 'loadScript').mockImplementation(jest.fn());

            try {
                await subject.getPayPalAxo(paymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('returns PayPal AXO Sdk', async () => {
            const result = await subject.getPayPalAxo(paymentMethod, 'USD');

            expect(result).toEqual(paypalAxoSdk);
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
                await subject.getPayPalFastlaneSdk(mockPaymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads PayPal Fastlane sdk script', async () => {
            await subject.getPayPalFastlaneSdk(paymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': '123456789',
                        'data-namespace': 'paypalFastlane',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'asdcvY7XFSQasd',
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

            await subject.getPayPalFastlaneSdk(mockPaymentMethod, 'USD');

            expect(loader.loadScript).toHaveBeenCalledWith(
                'https://www.paypal.com/sdk/js?client-id=abc&merchant-id=JTS4DY7XFSQZE&commit=true&components=fastlane&currency=USD&intent=capture',
                {
                    async: true,
                    attributes: {
                        'data-client-metadata-id': '123456789',
                        'data-namespace': 'paypalFastlane',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'connectClientToken123',
                    },
                },
            );
        });

        it('throws an error if there was an issue with loading PayPal Fastlane Sdk', async () => {
            jest.spyOn(loader, 'loadScript').mockImplementation(jest.fn());

            try {
                await subject.getPayPalAxo(paymentMethod, 'USD');
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('returns PayPal Fastlane Sdk', async () => {
            const result = await subject.getPayPalFastlaneSdk(paymentMethod, 'USD');

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
                        'data-user-id-token': 'asdcvY7XFSQasd',
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
});
