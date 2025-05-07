import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BigCommercePaymentsFastlaneUtils from './bigcommerce-payments-fastlane-utils';

export default function createBigCommercePaymentsFastlaneUtils(): BigCommercePaymentsFastlaneUtils {
    return new BigCommercePaymentsFastlaneUtils(new BrowserStorage('paypalFastlane'));
}
