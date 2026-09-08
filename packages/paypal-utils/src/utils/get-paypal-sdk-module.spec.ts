import { PayPalSdkNamespace } from '../paypal-constants';
import { PayPalHostWindow, PayPalSDK } from '../paypal-types';

import getPayPalSdkModule from './get-paypal-sdk-module';

describe('getPayPalSdkModule', () => {
    afterEach(() => {
        (window as PayPalHostWindow).paypal = undefined;
        (window as PayPalHostWindow).bigCommercePaymentsPayPalSDK = undefined;
    });

    it('returns the module registered under the provided namespace', () => {
        const paypalSdk = {} as PayPalSDK;

        (window as PayPalHostWindow).paypal = paypalSdk;

        expect(getPayPalSdkModule(PayPalSdkNamespace.PayPal)).toBe(paypalSdk);
    });

    it('returns the module registered under the bigcommerce payments namespace', () => {
        const paypalSdk = {} as PayPalSDK;

        (window as PayPalHostWindow).bigCommercePaymentsPayPalSDK = paypalSdk;

        expect(getPayPalSdkModule(PayPalSdkNamespace.BigCommercePaymentsPayPalSDK)).toBe(paypalSdk);
    });

    it('returns undefined when the module is not loaded', () => {
        expect(getPayPalSdkModule(PayPalSdkNamespace.PayPal)).toBeUndefined();
    });
});
