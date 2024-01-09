import createPayPalCommerceAcceleratedCheckoutUtils from './create-paypal-commerce-accelerated-checkout-utils';
import PayPalCommerceAcceleratedCheckoutUtils from './paypal-commerce-accelerated-checkout-utils';

describe('createPayPalCommerceIntegrationService', () => {
    it('instantiates PayPal Commerce Accelerated Checkout utils class', () => {
        const utilsClass = createPayPalCommerceAcceleratedCheckoutUtils();

        expect(utilsClass).toBeInstanceOf(PayPalCommerceAcceleratedCheckoutUtils);
    });
});
