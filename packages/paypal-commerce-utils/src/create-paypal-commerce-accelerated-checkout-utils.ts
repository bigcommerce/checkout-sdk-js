import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import PayPalCommerceAcceleratedCheckoutUtils from './paypal-commerce-accelerated-checkout-utils';

// TODO: remove this file when PPCP AXO strategies will be moved to PayPal Fastlane
export default function createPayPalCommerceAcceleratedCheckoutUtils(): PayPalCommerceAcceleratedCheckoutUtils {
    return new PayPalCommerceAcceleratedCheckoutUtils(new BrowserStorage('paypalConnect'));
}
