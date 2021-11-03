export interface ApplePayWindow extends Window {
    ApplePaySession(): void;
}

export default function isApplePayWindow(window: Window): window is ApplePayWindow {
    return 'ApplePaySession' in window;
}
