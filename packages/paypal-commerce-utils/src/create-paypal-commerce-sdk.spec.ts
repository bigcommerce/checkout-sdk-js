import createPayPalCommerceSdk from './create-paypal-commerce-sdk';
import PayPalCommerceSdk from './paypal-commerce-sdk';

describe('createPayPalCommerceSdk', () => {
    it('instantiates PayPal Commerce SDK', () => {
        const paypalCommerceSdkInstance = createPayPalCommerceSdk();

        expect(paypalCommerceSdkInstance).toBeInstanceOf(PayPalCommerceSdk);
    });
});
