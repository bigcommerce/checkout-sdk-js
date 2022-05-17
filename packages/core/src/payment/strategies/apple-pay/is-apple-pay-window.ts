export interface ApplePayWindow extends Window {
    ApplePaySession: ApplePaySession;
}

export default function isApplePayWindow(window: Window): window is ApplePayWindow {
    return 'ApplePaySession' in window;
}

export function assertApplePayWindow(window: Window): asserts window is ApplePayWindow {
    if (!isApplePayWindow(window)) {
        throw new Error('Apple pay is not supported');
    }
}
