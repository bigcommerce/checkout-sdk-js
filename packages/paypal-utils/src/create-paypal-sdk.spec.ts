import createPaypalSdk from './create-paypal-sdk';
import PaypalSdkScriptLoader from './paypal-sdk-script-loader';

describe('createPaypalSdk', () => {
    it('instantiates Paypal SDK', () => {
        const paypalSdkInstance = createPaypalSdk();

        expect(paypalSdkInstance).toBeInstanceOf(PaypalSdkScriptLoader);
    });
});
