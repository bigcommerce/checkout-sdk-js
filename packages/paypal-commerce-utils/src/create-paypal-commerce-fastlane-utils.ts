import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import PayPalCommerceFastlaneUtils from './paypal-commerce-fastlane-utils';

export default function createPayPalCommerceFastlaneUtils(): PayPalCommerceFastlaneUtils {
    return new PayPalCommerceFastlaneUtils(new BrowserStorage('paypalFastlane'));
}
