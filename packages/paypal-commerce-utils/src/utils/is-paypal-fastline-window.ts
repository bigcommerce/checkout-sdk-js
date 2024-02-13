import { PayPalCommerceHostWindow } from '../paypal-commerce-types';

export default function isPayPalFastlaneWindow(window: Window): window is PayPalCommerceHostWindow {
    return window.hasOwnProperty('paypalFastlane');
}
