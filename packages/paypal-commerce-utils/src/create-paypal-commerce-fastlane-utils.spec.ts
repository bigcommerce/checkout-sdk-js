import createPayPalCommerceFastlaneUtils from './create-paypal-commerce-fastlane-utils';
import PayPalCommerceFastlaneUtils from './paypal-commerce-fastlane-utils';

describe('createPayPalCommerceFastlaneUtils', () => {
    it('instantiates PayPal Commerce Fastlane utils class', () => {
        const utilsClass = createPayPalCommerceFastlaneUtils();

        expect(utilsClass).toBeInstanceOf(PayPalCommerceFastlaneUtils);
    });
});
