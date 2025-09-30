import createPaypalFastlaneUtils from './create-paypal-fastlane-utils';
import PaypalFastlaneUtils from './paypal-fastlane-utils';

describe('createPayPalFastlaneUtils', () => {
    it('instantiates PayPal Fastlane utils class', () => {
        const utilsClass = createPaypalFastlaneUtils();

        expect(utilsClass).toBeInstanceOf(PaypalFastlaneUtils);
    });
});
