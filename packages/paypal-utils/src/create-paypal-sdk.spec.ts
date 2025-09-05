import createPaypalSdk from './create-paypal-sdk';
import PaypalSdk from './paypal-sdk';

describe('createPaypalSdk', () => {
    it('instantiates Paypal SDK', () => {
        const paypalSdkInstance = createPaypalSdk();

        expect(paypalSdkInstance).toBeInstanceOf(PaypalSdk);
    });
});
