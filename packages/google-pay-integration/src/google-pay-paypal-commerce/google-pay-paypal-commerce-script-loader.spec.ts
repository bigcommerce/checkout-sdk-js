import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isGooglePayPaypalCommercePaymentMethod from '../guards/is-google-pay-paypal-commerce-payment-method';
import { getPayPalCommerce } from '../mocks/google-pay-payment-method.mock';
import { GooglePayInitializationData } from '../types';

import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';
import { AllowedPaymentMethods, PayPalCommerceHostWindow } from './types';

describe('PayPalCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PayPalCommerceScriptLoader;
    let googlePayPaymentMethod: PaymentMethod<GooglePayInitializationData>;
    let allowedPaymentMethodsMock: {
        allowedPaymentMethods: Array<Omit<AllowedPaymentMethods, 'type' | 'parameters'>>;
    };

    beforeEach(() => {
        loader = createScriptLoader();
        paypalLoader = new PayPalCommerceScriptLoader(loader);
        googlePayPaymentMethod = getPayPalCommerce();
        allowedPaymentMethodsMock = {
            allowedPaymentMethods: [
                {
                    tokenizationSpecification: {
                        type: 'type',
                        parameters: {
                            gatewayMerchantId: 'ID',
                            gateway: 'paypalcommerce',
                        },
                    },
                },
            ],
        };

        const paypalSDK = {
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn().mockResolvedValue(allowedPaymentMethodsMock),
            }),
        };

        jest.spyOn(paypalLoader, 'getPayPalSDK').mockImplementation(() => {
            (window as PayPalCommerceHostWindow).paypal = paypalSDK;

            return Promise.resolve(paypalSDK);
        });
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypal = undefined;
    });

    it('getPayPalSDK loads payPalSdk script', async () => {
        isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

        await paypalLoader.getPayPalSDK(googlePayPaymentMethod, 'USD');

        expect(paypalLoader.getPayPalSDK).toHaveBeenCalled();
    });

    it('getPayPalSDK throws an error if client is not initialized', async () => {
        let err;

        try {
            await paypalLoader.getGooglePayConfigOrThrow();
        } catch (e) {
            err = e;
        } finally {
            expect(err).toBeInstanceOf(PaymentMethodClientUnavailableError);
        }
    });

    it('getGooglePayConfigOrThrow loads GooglePay config', async () => {
        isGooglePayPaypalCommercePaymentMethod(googlePayPaymentMethod);

        await paypalLoader.getPayPalSDK(googlePayPaymentMethod, 'USD');

        const config = await paypalLoader.getGooglePayConfigOrThrow();

        expect(config).toEqual(expect.objectContaining(allowedPaymentMethodsMock));
    });
});
