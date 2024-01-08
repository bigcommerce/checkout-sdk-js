import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getPayPalAxoSdk, getPayPalCommerceAcceleratedCheckoutPaymentMethod } from './mocks';
import PayPalCommerceSdk from './paypal-commerce-sdk';
import {
    PayPalAxoSdk,
    PayPalCommerceHostWindow,
    PayPalCommerceInitializationData,
} from './paypal-commerce-types';

describe('PayPalCommerceSdk', () => {
    let loader: ScriptLoader;
    let paymentMethod: PaymentMethod<PayPalCommerceInitializationData>;
    let paypalAxoSdk: PayPalAxoSdk;
    let subject: PayPalCommerceSdk;

    beforeEach(() => {
        loader = createScriptLoader();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
        paypalAxoSdk = getPayPalAxoSdk();
        subject = new PayPalCommerceSdk(loader);

        jest.spyOn(loader, 'loadScript').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypalAxo = paypalAxoSdk;

            return Promise.resolve();
        });
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypalAxo = undefined;

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
});
