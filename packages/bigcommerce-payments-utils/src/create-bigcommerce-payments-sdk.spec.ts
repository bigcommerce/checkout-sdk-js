import BigCommercePaymentsSdk from './bigcommerce-payments-sdk';
import createBigCommercePaymentsSdk from './create-bigcommerce-payments-sdk';

describe('createBigCommercePaymentsSdk', () => {
    it('instantiates BigCommerce Payments SDK', () => {
        const BigCommercePaymentsSdkInstance = createBigCommercePaymentsSdk();

        expect(BigCommercePaymentsSdkInstance).toBeInstanceOf(BigCommercePaymentsSdk);
    });
});
