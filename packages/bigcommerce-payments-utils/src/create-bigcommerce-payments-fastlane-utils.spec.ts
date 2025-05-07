import BigCommercePaymentsFastlaneUtils from './bigcommerce-payments-fastlane-utils';
import createBigCommercePaymentsFastlaneUtils from './create-bigcommerce-payments-fastlane-utils';

describe('createBigCommercePaymentsFastlaneUtils', () => {
    it('instantiates BigCommerce Payments Fastlane utils class', () => {
        const utilsClass = createBigCommercePaymentsFastlaneUtils();

        expect(utilsClass).toBeInstanceOf(BigCommercePaymentsFastlaneUtils);
    });
});
