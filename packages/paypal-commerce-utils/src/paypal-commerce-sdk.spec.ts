import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getPayPalAxoSdk, getPayPalCommerceAcceleratedCheckoutPaymentMethod } from './mocks';
import PayPalCommerceSdk from './paypal-commerce-sdk';
import { PayPalAxoSdk, PayPalCommerceHostWindow, PayPalMessagesSdk } from './paypal-commerce-types';

describe('PayPalCommerceSdk', () => {
    let loader: ScriptLoader;
    let paymentMethod: PaymentMethod;
    let paypalAxoSdk: PayPalAxoSdk;
    let subject: PayPalCommerceSdk;
    const paypalMessagesSdk: PayPalMessagesSdk = {
        Messages: jest.fn(),
    };

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
        paypalAxoSdk = getPayPalAxoSdk();
        subject = new PayPalCommerceSdk(loader);

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypalAxo = paypalAxoSdk;
            (window as PayPalCommerceHostWindow).paypalMessages = paypalMessagesSdk;

            return Promise.resolve();
        });
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypalAxo = undefined;
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
                        'data-client-metadata-id': 'sandbox',
                        'data-namespace': 'paypalAxo',
                        'data-partner-attribution-id': '1123JLKJASD12',
                        'data-user-id-token': 'asdcvY7XFSQasd',
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
