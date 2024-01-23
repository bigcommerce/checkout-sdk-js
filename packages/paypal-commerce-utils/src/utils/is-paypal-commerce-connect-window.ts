import { PayPalCommerceHostWindow } from '../paypal-commerce-types';

export default function isPayPalCommerceConnectWindow(
    window: Window,
): window is PayPalCommerceHostWindow {
    return window.hasOwnProperty('paypalConnect');
}
