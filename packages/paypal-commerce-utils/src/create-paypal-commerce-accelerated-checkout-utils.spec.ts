import createPayPalCommerceAcceleratedCheckoutUtils from './create-paypal-commerce-accelerated-checkout-utils';
import PayPalCommerceAcceleratedCheckoutUtils from './paypal-commerce-accelerated-checkout-utils';

// TODO: remove this file when PPCP AXO strategies will be moved to PayPal Fastlane
describe('createPayPalCommerceIntegrationService', () => {
    it('instantiates PayPal Commerce Accelerated Checkout utils class', () => {
        const utilsClass = createPayPalCommerceAcceleratedCheckoutUtils();

        expect(utilsClass).toBeInstanceOf(PayPalCommerceAcceleratedCheckoutUtils);
    });
});
