import ApplePayWindow from './apple-pay-window';

export default function isApplePayWindow(window: Window): window is ApplePayWindow {
    return 'ApplePaySession' in window;
}
