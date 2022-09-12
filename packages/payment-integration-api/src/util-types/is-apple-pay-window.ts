export interface ApplePayWindow extends Window {
    ApplePaySession: ApplePaySession;
}

export default function isApplePayWindow(window: Window): window is ApplePayWindow {
    return 'ApplePaySession' in window;
}
