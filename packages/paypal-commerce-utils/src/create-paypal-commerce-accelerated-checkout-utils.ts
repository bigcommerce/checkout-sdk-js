import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import PayPalCommerceAcceleratedCheckoutUtils from './paypal-commerce-accelerated-checkout-utils';

export default function createPayPalCommerceAcceleratedCheckoutUtils(): PayPalCommerceAcceleratedCheckoutUtils {
    return new PayPalCommerceAcceleratedCheckoutUtils(new BrowserStorage('paypalConnect'));
}
