import createBigCommercePaymentsSdk from './create-bigcommerce-payments-sdk';
import PayPalSdkHelper from './paypal-sdk-helper';

describe('createBigCommercePaymentsSdk', () => {
    it('instantiates BigCommerce Payments SDK', () => {
        const BigCommercePaymentsSdkInstance = createBigCommercePaymentsSdk();

        expect(BigCommercePaymentsSdkInstance).toBeInstanceOf(PayPalSdkHelper);
    });
});
