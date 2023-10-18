import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';
import { PayPalCommerceHostWindow } from './types';

describe('PayPalCommerceScriptLoader', () => {
    let loader: ScriptLoader;
    let paypalLoader: PayPalCommerceScriptLoader;

    beforeEach(() => {
        loader = createScriptLoader();
        paypalLoader = new PayPalCommerceScriptLoader(loader);

        jest.spyOn(paypalLoader, 'loadPayPalGooglePaySDK').mockResolvedValue({
            Googlepay: jest.fn().mockReturnValue({
                config: jest.fn(),
            }),
        });
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypal = undefined;
    });

    it('getPayPalGooglePaySdkOrThrow loads payPalSdk script', async () => {
        await paypalLoader.getPayPalGooglePaySdkOrThrow('clientId', 'merchantId', 'clientToken');

        expect(paypalLoader.loadPayPalGooglePaySDK).toHaveBeenCalledWith(
            'clientId',
            'merchantId',
            'clientToken',
        );
    });

    it('getPayPalGooglePaySdkOrThrow throws an error if no arguments', async () => {
        let err;

        try {
            await paypalLoader.getPayPalGooglePaySdkOrThrow();
        } catch (e) {
            err = e;
        } finally {
            expect(err).toStrictEqual(
                new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
            );
        }
    });

    it('getGooglePayConfigOrThrow loads payPalSdk script', async () => {
        await paypalLoader.getGooglePayConfigOrThrow('clientId', 'merchantId', 'clientToken');

        expect(paypalLoader.loadPayPalGooglePaySDK).toHaveBeenCalledWith(
            'clientId',
            'merchantId',
            'clientToken',
        );
    });

    it('getGooglePayConfigOrThrow throws an error if no arguments', async () => {
        let err;

        try {
            await paypalLoader.getGooglePayConfigOrThrow();
        } catch (e) {
            err = e;
        } finally {
            expect(err).toStrictEqual(
                new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
            );
        }
    });
});
